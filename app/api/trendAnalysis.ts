import { GroqResponse } from '@/app/types';

const CONFIG = {
  GROQ_API_KEY: process.env.NEXT_PUBLIC_TGROQ_API_KEY as string
};

interface ChartDatasets {
  label: string;
  data: number[];
}

interface MarketAnalysisResponse {
  historicTrend: {
    title: string;
    labels: string[];
    datasets: ChartDatasets[];
  };
  marketShare: {
    title: string;
    labels: string[];
    data: number[];
  };
  sentiment: {
    title: string;
    labels: string[];
    data: number[];
  };
  regional: {
    title: string;
    labels: string[];
    data: number[];
  };
  demographics: {
    title: string;
    labels: string[];
    data: number[];
  };
  priceDistribution: {
    title: string;
    labels: string[];
    data: number[];
  };
}

const SYSTEM_PROMPT = JSON.stringify({
  description: 'Generate comprehensive market analysis data for visualization',
  requirements: [
    'Historic trend data',
    'Market share distribution',
    'User sentiment distribution', 
    'Regional distribution',
    'Age group distribution',
    'Price point distribution'
  ],
  responseFormat: {
    historicTrend: {
      title: 'string',
      labels: ['month1'],
      datasets: [{ label: 'string', data: [0] }]
    },
    marketShare: {
      title: 'string', 
      labels: ['company1'],
      data: [0]
    },
    sentiment: {
      title: 'string',
      labels: ['Positive', 'Neutral', 'Negative'],
      data: [0]
    },
    regional: {
      title: 'string', 
      labels: ['region1'],
      data: [0]
    },
    demographics: {
      title: 'string',
      labels: ['age1'], 
      data: [0]
    },
    priceDistribution: {
      title: 'string',
      labels: ['range1'],
      data: [0]
    }
  }
});

export class MarketAnalysisAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarketAnalysisAPIError';
  }
}

export async function fetchMarketAnalysisData(query: string): Promise<MarketAnalysisResponse> {
  if (!CONFIG.GROQ_API_KEY) {
    throw new MarketAnalysisAPIError('GROQ API key is not configured');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Generate market analysis visualization data for: ${query}`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new MarketAnalysisAPIError(`API request failed with status ${response.status}`);
    }

    const groqResponse: GroqResponse = await response.json();
    
    if (!groqResponse.choices?.[0]?.message?.content) {
      throw new MarketAnalysisAPIError('Invalid response format from API');
    }

    const data: MarketAnalysisResponse = JSON.parse(groqResponse.choices[0].message.content);
    return data;

  } catch (error) {
    if (error instanceof MarketAnalysisAPIError) {
      throw error;
    }
    throw new MarketAnalysisAPIError(
      error instanceof Error ? error.message : 'An unknown error occurred'
    );
  }
}

export const chartColors = {
  line: 'rgb(255, 159, 64)',
  pie: [
    'rgb(255, 159, 64)',  // orange
    'rgb(255, 127, 80)',  // coral
    'rgb(255, 140, 0)',   // dark orange
    'rgb(255, 165, 0)',   // orange
    'rgb(255, 179, 71)',  // mellow orange
    'rgb(255, 197, 92)'   // light orange
  ],
  bar: 'rgb(255, 159, 64)'
};