import { query } from "./db";
import nodemailer from 'nodemailer'

//send email part of sending email job
const sendEmail = async (toEmail:string) => {
    console.log("\n[Email Service] Generating mail server credentials...")

    // Ethereal automatically generates a temporary testing email account for us
    let testAccount = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
        host:"smtp.ethereal.email",
        port:587,
        auth:{
            user:testAccount.user,
            pass:testAccount.pass
        },
    })

    console.log(`[Email Service] Sending email to ${toEmail}...`)
    //Send email 
    let info = await transporter.sendMail({
        from:'"Job Queue Engine" <queue@example.com>',
        to: toEmail,
        subject:"Hello from backend worker",
        text: "This is a real email sent by your background worker process."
    })
    //URL where you can view the sent email in your browser
    console.log(`[Email Service] SUCCESS View Email here:${nodemailer.getTestMessageUrl(info)}\n`) 
}

const processJob = async (job:any) => {
    console.log(`[Worker] Processing Job #${job.id} (Priority:${job.priority})`)

    //check the payload to see what task the (Express API) wrote on the ticket
    if(job.payload.task == "send_email"){
        await sendEmail(job.payload.to)
    }
    else{
        console.log(`[Worker] Unknown task type. Doing nothing.\n`)
    }
}

const pollQueue = async () => {
    try{
        const sql = `
        UPDATE jobs
        SET status = 'processing', updated_at = NOW()
        WHERE id = (
        SELECT id
        FROM jobs
        WHERE status = 'queued' AND run_at <= NOW()
        ORDER BY priority DESC, run_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
        )
        RETURNING *
        `
        const result = await query(sql)
        const job = result.rows[0]

        if(job){
            // 1. Process the job (Send the email)
            await processJob(job)
            // 2. Mark the ticket as completed on the rail
            await query(`
                UPDATE jobs
                SET status = completed,
                updated_at = NOW()
                WHERE id = $1
                `,[job.id]
            )
            // 3. Keep polling the rail for the next ticket
            pollQueue()
        }
        else{
            setTimeout(pollQueue,1000)
        }
    }
    catch(error){
        console.error("[Worker] Error polling queue:",error)
        setTimeout(pollQueue,5000)
    }
}

console.log("[Worker] Worker started listining for jobs...")
pollQueue()

