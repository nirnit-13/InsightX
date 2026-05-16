import client from './client'

export const reportsAPI = {
  generateInsight: (context)      => client.post('/ai/insights',         { context }),
  generateReport:  (type, data)   => client.post('/ai/generate-report',  { report_type: type, analytics_data: data }),
  chat:            (messages, ctx)=> client.post('/ai/chat',             { messages, context: ctx }),
}