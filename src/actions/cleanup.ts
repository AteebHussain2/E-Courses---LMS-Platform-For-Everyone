// 'use server';

// import 'dotenv';

// export const cleanupJob = schedules.task({
//     id: "cleanup-soft-deletes",
//     cron: "0 3 * * *",  // 3am daily
//     run: async () => {
//         await fetch(`${process.env.FRONTEND_URL}/api/cleanup`, {
//             method: "DELETE",
//             headers: { "x-api-secret": process.env.API_SECRET! }
//         })
//     }
// })