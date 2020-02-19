import { sdk } from '@cto.ai/sdk'

export const track = async (eventLog: string | Error) => {
  if (typeof eventLog === 'string' || eventLog instanceof String) {
    await sdk.track(['track', 'measure'], {
      event: eventLog,
    })
  }
  if (eventLog instanceof Error) {
    await sdk.track(['track', 'measure', 'error'], {
      event: eventLog.toString(),
      error: eventLog.stack,
    })
  }
}
