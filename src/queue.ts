import { query } from "./db";


export const enqueueJob = async (payload:any,priority:number=0) => {

    const sql = `
    INSERT INTO jobs (payload,priority)
    VALUES ($1,$2)
    RETURNING id, status, created_at;
    `

    const result  = await query(sql,[payload,priority])

    return result.rows[0]
}
