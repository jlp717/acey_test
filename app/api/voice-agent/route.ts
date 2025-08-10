import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  const hfKey = process.env.HF_API_KEY
  const response = await fetch(
    'https://api-inference.huggingface.co/models/google/flan-t5-base',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hfKey ? { Authorization: `Bearer ${hfKey}` } : {})
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 50 } })
    }
  )

  const data = await response.json()
  let answer = 'Lo siento, no tengo una respuesta.'
  if (Array.isArray(data) && data[0]?.generated_text) {
    answer = data[0].generated_text
  } else if (data?.generated_text) {
    answer = data.generated_text
  }
  return NextResponse.json({ answer })
}
