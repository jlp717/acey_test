import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, history = [] } = await req.json()
  const hfKey = process.env.HF_API_KEY
  const hfModel = process.env.HF_MODEL ?? 'mistralai/Mistral-7B-Instruct-v0.1'

  const historyText = history
    .map((m: any) => `${m.role}: ${m.content}`)
    .join('\n')
  const inputs = `${historyText}\nuser: ${prompt}\nassistant:`

  if (!hfKey) {
    return NextResponse.json({ answer: 'Falta configurar HF_API_KEY.' }, { status: 200 })
  }

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${hfModel}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hfKey}`
        },
        body: JSON.stringify({
          inputs,
          parameters: { max_new_tokens: 100 },
          options: { wait_for_model: true }
        })
      }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = data?.error || 'Error al contactar el modelo.'
      return NextResponse.json(
        { answer: error },
        { status: response.status }
      )
    }
    let answer = 'Lo siento, no tengo una respuesta.'
    if (Array.isArray(data) && data[0]?.generated_text) {
      answer = data[0].generated_text
    } else if (data?.generated_text) {
      answer = data.generated_text
    }

    return NextResponse.json({ answer })
  } catch (e) {
    return NextResponse.json(
      { answer: 'Error al contactar el modelo.' },
      { status: 500 }
    )
  }
}
