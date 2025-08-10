import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, history = [] } = await req.json()
  const hfKey = process.env.HF_API_KEY

  const historyText = history
    .map((m: any) => `${m.role}: ${m.content}`)
    .join('\n')
  const inputs = `${historyText}\nuser: ${prompt}\nassistant:`
  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hfKey ? { Authorization: `Bearer ${hfKey}` } : {})
      },
      body: JSON.stringify({
        inputs,
        parameters: { max_new_tokens: 100 },
        options: { wait_for_model: true }
      })
    }
  )

  if (!response.ok) {
    return NextResponse.json(
      { answer: 'Error al contactar el modelo.' },
      { status: response.status }
    )
  }

  const data = await response.json()
  let answer = 'Lo siento, no tengo una respuesta.'
  if (Array.isArray(data) && data[0]?.generated_text) {
    answer = data[0].generated_text
  } else if (data?.generated_text) {
    answer = data.generated_text
  }

  return NextResponse.json({ answer })
}
