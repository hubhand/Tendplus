# TEND+ Project Analysis & Expansion Plan

## 📋 Executive Summary

**Tend+** is a specialized health-aware shopping platform built with Next.js that helps users find products compatible with their health profiles. The system uses AI to extract ingredient data and filters products based on user allergies, medications, and health concerns.

---

## 🏗️ Current Architecture Overview

### **Technology Stack**
- **Frontend Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Authentication**: Clerk (OAuth/Passwordless)
- **Database**: Supabase (PostgreSQL with RLS)
- **AI/ML**: Google Gemini 2.0 Flash
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Package Manager**: pnpm 8.15.0
- **Runtime**: Node.js ≥20.20.0

### **Key Dependencies**
- `@clerk/nextjs`: User authentication
- `@supabase/supabase-js`: Database client
- `@google/generative-ai`: AI-powered OCR and analysis
- `@upstash/ratelimit`: API rate limiting
- `react-webcam`: Camera capture for product scanning
- `zod`: Schema validation

---

## 📊 Database Schema Analysis

### **Core Tables**

#### 1. **users_profile**
```sql
- id (uuid, PK)
- clerk_id (text, unique) -- Links to Clerk auth
- email (text, unique)
- display_name (text)
- role (enum: user, admin, super_admin)
- status (enum: active, suspended, deleted)
- created_at (timestamptz)
```
**Purpose**: Stores user account information synced with Clerk

#### 2. **health_profiles**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users_profile)
- allergies (jsonb, encrypted)
- medications (jsonb, encrypted)
- skin_concerns (jsonb, encrypted)
- chronic_conditions (jsonb, encrypted)
- blacklist_ingredients (jsonb, encrypted)
- created_at, updated_at (timestamptz)
```
**Purpose**: Stores user health data with field-level encryption
**Security**: All sensitive fields are AES-256-GCM encrypted

#### 3. **ingredients**
```sql
- id (uuid, PK)
- name_ko (text) -- Korean name
- name_ko_normalized (generated) -- Searchable version
- name_en (text) -- English name
- ingredients_list (jsonb) -- Sub-ingredients
- allergens (jsonb) -- Known allergens
- cached_at (timestamptz) -- Cache timestamp
- created_at (timestamptz)
```
**Purpose**: Master ingredient database with normalization for matching

#### 4. **products**
```sql
- id (uuid, PK)
- name (text)
- brand (text)
- category (text)
- image_url (text)
- description (text)
- created_at (timestamptz)
```
**Purpose**: Product catalog (currently minimal schema)

#### 5. **product_ingredients**
```sql
- id (uuid, PK)
- product_id (uuid, FK → products)
- ingredient_id (uuid, FK → ingredients)
- amount (text)
- position (int) -- Order in ingredient list
- created_at (timestamptz)
- UNIQUE(product_id, ingredient_id)
```
**Purpose**: Many-to-many relationship between products and ingredients

#### 6. **scan_history**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users_profile)
- product_id (uuid, FK → products, nullable)
- image_url (text)
- ocr_result (jsonb)
- confidence (decimal)
- created_at (timestamptz)
```
**Purpose**: Tracks user scans and OCR results

#### 7. **pantry_items**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users_profile)
- product_id (uuid, FK → products)
- status (enum: unopened, opened, almost_empty, empty)
- added_at, opened_at (timestamptz)
- expiry_date (date)
- notified_at (timestamptz)
- created_at (timestamptz)
```
**Purpose**: User's product inventory with expiration tracking

#### 8. **notifications**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users_profile)
- type (text)
- title (text)
- body (text)
- data (jsonb)
- read (boolean)
- created_at (timestamptz)
```
**Purpose**: User notification system

---

## 🔄 Current User Flow

### **1. User Registration & Authentication**
```
User → Clerk Sign-up → Webhook (/api/webhooks/clerk) → Create users_profile
```

### **2. Health Profile Setup**
```
User → /health page → Enter allergies/medications → Encrypt & Store in health_profiles
```

### **3. Product Scanning**
```
User → /scan page → Two options:
  A. Photo: Camera → Upload → /api/ai/ocr → Gemini Vision → Extract ingredients
  B. Manual: Text input form → Submit
  
Result → Display ingredients → (Not currently saved to products table)
```

### **4. Product Browsing**
```
User → /products → Display all products → Click product → /products/[id] → Show details
(No filtering by health profile currently implemented)
```

---

## 🎯 Current Features

### ✅ **Implemented**
1. **User Authentication** (Clerk)
   - OAuth, passwordless, email/password
   - Webhook integration for profile creation
   
2. **Health Profile Management**
   - CRUD operations on health data
   - Field-level encryption (AES-256-GCM)
   - Text input for allergies, medications, conditions
   
3. **AI-Powered OCR**
   - Gemini 2.0 Flash integration
   - Image → JSON extraction
   - Confidence scoring
   
4. **Product Catalog**
   - Basic product listing
   - Product detail pages
   - Image support
   
5. **Scan History**
   - Track user scans
   - Store OCR results

6. **Security**
   - Row-Level Security (RLS) policies
   - Rate limiting (Upstash)
   - Environment variable protection
   - Sensitive data encryption

### ❌ **Not Yet Implemented**
1. **Ingredient Extraction → Database Storage**
   - Scanned ingredients are displayed but NOT saved to `products` or `ingredients` tables
   
2. **Health-Based Product Filtering**
   - No automatic filtering of products based on user's health profile
   - Products page shows all products regardless of compatibility
   
3. **Real-Time Compatibility Checking**
   - No warning system when viewing incompatible products
   
4. **Chatbot Interface**
   - No conversational AI for health data input
   
5. **Voice Input**
   - No speech-to-text functionality

---

## 🚀 Expansion Plan: AI Chatbot + Auto-Filtering System

### **Goal**
Build an intelligent system that:
1. Extracts ingredient data from user inputs (text/photo/voice)
2. Stores ingredients in Supabase
3. Automatically filters products incompatible with each user's health profile

---

## 📐 Proposed Architecture

### **Phase 1: Chatbot Interface** (3-5 days)

#### **A. Create Chat UI Component**
**File**: `src/components/health/HealthChatbot.tsx`

```typescript
'use client';

import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function HealthChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call API to process message
      const response = await fetch('/api/health-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <span className="animate-pulse">AI가 응답 중...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="예: 땅콩 알러지가 있어요"
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </div>
  );
}
```

#### **B. Create Chat API Endpoint**
**File**: `src/app/api/health-chat/route.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentUserId, createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/security/encryption';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await req.json();
  
  // Get user's current health profile
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Create context-aware prompt
  const systemPrompt = `당신은 건강 정보 수집 전문 AI 어시스턴트입니다.
사용자의 알러지, 복용 약물, 피부 고민, 만성 질환, 피해야 할 성분 정보를 수집합니다.

현재 사용자 정보:
- 알러지: ${profile?.allergies || '없음'}
- 복용약: ${profile?.medications || '없음'}
- 피부고민: ${profile?.skin_concerns || '없음'}
- 만성질환: ${profile?.chronic_conditions || '없음'}
- 피해야 할 성분: ${profile?.blacklist_ingredients || '없음'}

사용자가 새로운 정보를 제공하면:
1. 정보를 추출하세요
2. JSON 형식으로 반환하세요:
{
  "extracted_data": {
    "allergies": ["땅콩", "대두"],
    "medications": [],
    "skin_concerns": [],
    "chronic_conditions": [],
    "blacklist_ingredients": []
  },
  "reply": "땅콩과 대두 알러지를 저장했어요. 제품 추천 시 이 성분들을 피하겠습니다."
}

친근하고 공감하는 톤으로 대화하세요.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `사용자: ${message}` }
    ]);

    const responseText = result.response.text();
    
    // Try to extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Update health profile with extracted data
      if (parsed.extracted_data) {
        const updateData: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(parsed.extracted_data)) {
          if (Array.isArray(value) && value.length > 0) {
            // Merge with existing data
            const existing = profile?.[key] || [];
            const merged = [...new Set([...existing, ...value])];
            updateData[key] = encrypt(JSON.stringify(merged));
          }
        }
        
        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('health_profiles')
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }
      }
      
      return Response.json({ reply: parsed.reply });
    }
    
    // Fallback if no JSON found
    return Response.json({ reply: responseText });
    
  } catch (error) {
    console.error('Chat AI error:', error);
    return Response.json(
      { reply: '죄송합니다. 오류가 발생했어요. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
```

#### **C. Integrate into Health Page**
**Update**: `src/app/health/page.tsx`

Add import at top:
```typescript
import { HealthChatbot } from '@/components/health/HealthChatbot';
```

Add tab switching and render chatbot:
```typescript
const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');

// In the render section, add tabs:
<div className="mb-6 flex gap-4 border-b">
  <button
    onClick={() => setActiveTab('form')}
    className={`pb-2 ${activeTab === 'form' ? 'border-b-2 border-emerald-600' : ''}`}
  >
    직접 입력
  </button>
  <button
    onClick={() => setActiveTab('chat')}
    className={`pb-2 ${activeTab === 'chat' ? 'border-b-2 border-emerald-600' : ''}`}
  >
    AI 채팅으로 입력
  </button>
</div>

{activeTab === 'form' ? (
  <form onSubmit={handleSubmit}>
    {/* existing form */}
  </form>
) : (
  <HealthChatbot />
)}
```

---

### **Phase 2: Enhanced Ingredient Storage** (2-3 days)

#### **A. Update OCR API to Save Ingredients**
**File**: `src/app/api/ai/ocr/route.ts`

```typescript
// After successful OCR, add this code:

const { data } = await result.json();

// Create or find product
const { data: product, error: productError } = await supabase
  .from('products')
  .insert({
    name: data.product_name,
    category: 'scanned', // or detect from image
  })
  .select()
  .single();

if (product && data.ingredients_list) {
  // Process each ingredient
  for (let i = 0; i < data.ingredients_list.length; i++) {
    const ingredientName = data.ingredients_list[i];
    
    // Normalize ingredient name
    const normalized = ingredientName
      .toLowerCase()
      .replace(/[^가-힣a-zA-Z0-9]/g, '')
      .replace(/\s+/g, '');
    
    // Check if ingredient exists
    let { data: ingredient } = await supabase
      .from('ingredients')
      .select('id')
      .eq('name_ko_normalized', normalized)
      .single();
    
    // If not exists, create it
    if (!ingredient) {
      const { data: newIngredient } = await supabase
        .from('ingredients')
        .insert({ name_ko: ingredientName })
        .select()
        .single();
      
      ingredient = newIngredient;
    }
    
    // Link ingredient to product
    if (ingredient) {
      await supabase
        .from('product_ingredients')
        .insert({
          product_id: product.id,
          ingredient_id: ingredient.id,
          position: i + 1,
        })
        .onConflict('product_id,ingredient_id')
        .ignore();
    }
  }
}

// Also save to scan_history
await supabase.from('scan_history').insert({
  user_id: userId,
  product_id: product?.id,
  ocr_result: data,
  confidence: data.confidence,
});
```

#### **B. Create Ingredient Analysis Service**
**File**: `src/lib/services/ingredient-analyzer.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/security/encryption';

interface HealthProfile {
  allergies: string[];
  medications: string[];
  blacklist_ingredients: string[];
}

interface CompatibilityResult {
  compatible: boolean;
  warnings: string[];
  concerns: {
    type: 'allergy' | 'medication' | 'blacklist';
    ingredient: string;
    reason: string;
  }[];
}

export async function checkProductCompatibility(
  productId: string,
  userId: string
): Promise<CompatibilityResult> {
  const supabase = await createClient();
  
  // Get user's health profile
  const { data: profile } = await supabase
    .from('health_profiles')
    .select('allergies, medications, blacklist_ingredients')
    .eq('user_id', userId)
    .single();
  
  if (!profile) {
    return { compatible: true, warnings: [], concerns: [] };
  }
  
  // Decrypt fields
  const healthData: HealthProfile = {
    allergies: JSON.parse(decrypt(profile.allergies)),
    medications: JSON.parse(decrypt(profile.medications)),
    blacklist_ingredients: JSON.parse(decrypt(profile.blacklist_ingredients)),
  };
  
  // Get product ingredients
  const { data: productIngredients } = await supabase
    .from('product_ingredients')
    .select(`
      ingredient_id,
      ingredients (
        name_ko,
        name_en,
        allergens
      )
    `)
    .eq('product_id', productId);
  
  if (!productIngredients || productIngredients.length === 0) {
    return { compatible: true, warnings: [], concerns: [] };
  }
  
  const concerns: CompatibilityResult['concerns'] = [];
  const warnings: string[] = [];
  
  // Check each ingredient
  for (const pi of productIngredients) {
    const ingredient = pi.ingredients;
    const ingredientName = ingredient.name_ko.toLowerCase();
    
    // Check allergies
    for (const allergy of healthData.allergies) {
      if (ingredientName.includes(allergy.toLowerCase())) {
        concerns.push({
          type: 'allergy',
          ingredient: ingredient.name_ko,
          reason: `${allergy} 알러지 성분 포함`,
        });
        warnings.push(`⚠️ 알러지 주의: ${ingredient.name_ko}`);
      }
    }
    
    // Check blacklist
    for (const blacklisted of healthData.blacklist_ingredients) {
      if (ingredientName.includes(blacklisted.toLowerCase())) {
        concerns.push({
          type: 'blacklist',
          ingredient: ingredient.name_ko,
          reason: `피해야 할 성분: ${blacklisted}`,
        });
        warnings.push(`❌ 피해야 할 성분: ${ingredient.name_ko}`);
      }
    }
  }
  
  return {
    compatible: concerns.length === 0,
    warnings,
    concerns,
  };
}
```

---

### **Phase 3: Smart Product Filtering** (2-3 days)

#### **A. Update Products Page with Filtering**
**File**: `src/app/products/page.tsx`

```typescript
import { getCurrentUserId } from '@/lib/supabase/server';
import { checkProductCompatibility } from '@/lib/services/ingredient-analyzer';

export default async function ProductsPage() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  
  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  // If user is logged in, check compatibility
  let productsWithCompatibility = products;
  
  if (userId && products) {
    productsWithCompatibility = await Promise.all(
      products.map(async (product) => {
        const compatibility = await checkProductCompatibility(product.id, userId);
        return {
          ...product,
          compatible: compatibility.compatible,
          warnings: compatibility.warnings,
        };
      })
    );
  }
  
  // Filter products
  const safeProducts = productsWithCompatibility?.filter(p => p.compatible);
  const warningProducts = productsWithCompatibility?.filter(p => !p.compatible);
  
  return (
    <div className="...">
      {/* Filter Controls */}
      <div className="mb-6 flex gap-4">
        <button className="...">모든 제품 ({products?.length || 0})</button>
        <button className="...">안전한 제품 ({safeProducts?.length || 0})</button>
        <button className="...text-yellow-600">주의 필요 ({warningProducts?.length || 0})</button>
      </div>
      
      {/* Product Grid */}
      <ul className="grid ...">
        {productsWithCompatibility?.map(product => (
          <li key={product.id}>
            <Link href={`/products/${product.id}`}>
              {/* Product Card */}
              <div className="...">
                {!product.compatible && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    ⚠️ 주의
                  </div>
                )}
                {/* ... rest of card */}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### **B. Enhanced Product Detail Page**
**File**: `src/app/products/[id]/page.tsx`

```typescript
import { checkProductCompatibility } from '@/lib/services/ingredient-analyzer';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  
  // Get product with ingredients
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_ingredients (
        ingredient_id,
        amount,
        position,
        ingredients (
          name_ko,
          name_en,
          allergens
        )
      )
    `)
    .eq('id', id)
    .single();
  
  // Check compatibility
  let compatibility;
  if (userId) {
    compatibility = await checkProductCompatibility(id, userId);
  }
  
  return (
    <div className="...">
      <h1>{product.name}</h1>
      
      {/* Compatibility Alert */}
      {compatibility && !compatibility.compatible && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <h3 className="font-bold text-red-800">⚠️ 건강 프로필 주의사항</h3>
          <ul className="mt-2 space-y-1">
            {compatibility.concerns.map((concern, i) => (
              <li key={i} className="text-red-700 text-sm">
                • {concern.ingredient}: {concern.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {compatibility?.compatible && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-800">✅ 이 제품은 회원님의 건강 프로필과 호환됩니다</p>
        </div>
      )}
      
      {/* Ingredients List */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">성분 목록</h2>
        <ul className="space-y-2">
          {product.product_ingredients
            .sort((a, b) => a.position - b.position)
            .map((pi) => (
              <li key={pi.ingredient_id} className="flex items-center gap-2">
                <span>{pi.position}.</span>
                <span className="font-medium">{pi.ingredients.name_ko}</span>
                {pi.amount && <span className="text-sm text-gray-500">({pi.amount})</span>}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
```

---

### **Phase 4: Voice Input (Optional)** (2-3 days)

#### **A. Add Voice Capture Component**
**File**: `src/components/health/VoiceInput.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        onTranscript(data.text);
      }
    } catch (error) {
      console.error('Speech-to-text error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center text-2xl
          ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'}
          ${isProcessing ? 'opacity-50' : ''}
          text-white
        `}
      >
        {isProcessing ? '⏳' : isRecording ? '⏹️' : '🎤'}
      </button>
      <p className="text-sm text-gray-600">
        {isProcessing
          ? '음성 처리 중...'
          : isRecording
          ? '녹음 중... (클릭하여 중지)'
          : '클릭하여 녹음 시작'}
      </p>
    </div>
  );
}
```

#### **B. Speech-to-Text API**
**File**: `src/app/api/speech-to-text/route.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return Response.json({ error: 'No audio file' }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'audio/webm',
          data: base64Audio,
        },
      },
      { 
        text: '이 음성을 텍스트로 변환하세요. 한국어로 정확하게 변환해주세요.' 
      },
    ]);

    const text = result.response.text();
    
    return Response.json({ text });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return Response.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
```

---

## 🛠️ Implementation Steps for You (Using Cursor)

### **Week 1: Chatbot Foundation**

**Day 1-2: Setup Chatbot UI**
1. Open Cursor and navigate to `src/components/health/`
2. Create new file `HealthChatbot.tsx`
3. Copy the HealthChatbot component code I provided above
4. Save the file

**Day 3-4: Create Chat API**
1. Navigate to `src/app/api/`
2. Create new folder `health-chat`
3. Inside it, create `route.ts`
4. Copy the chat API code I provided
5. Make sure your `.env.local` has `GEMINI_API_KEY`

**Day 5: Integrate into Health Page**
1. Open `src/app/health/page.tsx`
2. Add the import for HealthChatbot
3. Add the tab switching logic
4. Test locally with `pnpm dev`

### **Week 2: Ingredient Storage**

**Day 6-7: Update OCR to Save Data**
1. Open `src/app/api/ai/ocr/route.ts`
2. Add the ingredient storage logic after OCR success
3. Test by scanning a product image

**Day 8-9: Create Analyzer Service**
1. Create new folder `src/lib/services/`
2. Create `ingredient-analyzer.ts`
3. Copy the compatibility checker code
4. Export the function

**Day 10: Test Ingredient Storage**
1. Scan multiple products
2. Check Supabase dashboard:
   - Products table should have new entries
   - Ingredients table should populate
   - product_ingredients should link them

### **Week 3: Smart Filtering**

**Day 11-13: Update Products Page**
1. Open `src/app/products/page.tsx`
2. Import the ingredient analyzer
3. Add compatibility checking logic
4. Add filter UI (Safe/Warning tabs)
5. Test with your health profile

**Day 14-15: Enhance Product Details**
1. Open `src/app/products/[id]/page.tsx`
2. Add compatibility alerts
3. Display ingredient list with warnings
4. Test various products

### **Testing Checklist**

✅ **Phase 1 Tests**
- [ ] Chatbot appears on health page
- [ ] Can send messages
- [ ] AI responds appropriately
- [ ] Health data is extracted and saved
- [ ] Existing health profile is considered

✅ **Phase 2 Tests**
- [ ] OCR creates products in database
- [ ] Ingredients are extracted and normalized
- [ ] product_ingredients table links correctly
- [ ] Duplicate ingredients aren't created

✅ **Phase 3 Tests**
- [ ] Products page shows compatibility badges
- [ ] Filtering by safe/warning works
- [ ] Product detail shows specific warnings
- [ ] Compatible products show green checkmark

---

## 📂 New Files to Create

```
src/
├── components/
│   └── health/
│       ├── HealthChatbot.tsx          ← NEW
│       └── VoiceInput.tsx             ← NEW (optional)
├── app/
│   └── api/
│       ├── health-chat/
│       │   └── route.ts               ← NEW
│       └── speech-to-text/
│           └── route.ts               ← NEW (optional)
└── lib/
    └── services/
        └── ingredient-analyzer.ts     ← NEW
```

---

## 🔒 Security Considerations

1. **Encryption**: All health data is encrypted with AES-256-GCM
2. **RLS**: Row-Level Security prevents unauthorized access
3. **Rate Limiting**: Upstash prevents API abuse
4. **Authentication**: Clerk handles secure auth
5. **Environment Variables**: Sensitive keys in `.env.local`

**Important**: Never commit `.env.local` to git!

---

## 💡 Tips for Non-Developers

1. **Use Cursor AI Assistant**
   - Press Cmd/Ctrl + K to ask Cursor to write code
   - Example: "Create a React component that displays chat messages"

2. **Test Frequently**
   - After each file creation, run `pnpm dev`
   - Check `http://localhost:3000` in browser
   - Look for errors in terminal

3. **Use Supabase Dashboard**
   - Go to your Supabase project
   - Click "Table Editor" to see data
   - Check if ingredients are being saved

4. **Debug with Console.log**
   - Add `console.log('My data:', data)` to see values
   - Open browser DevTools (F12) → Console tab

5. **Ask for Help**
   - Copy error messages
   - Share them with AI or community
   - Describe what you were trying to do

---

## 📊 Expected Results

### **Before Expansion**
- Users manually enter health data in text fields
- OCR extracts ingredients but doesn't save them
- Products show without health compatibility info

### **After Expansion**
- Users chat with AI to provide health info naturally
- OCR automatically populates ingredient database
- Products display compatibility badges (✅ Safe / ⚠️ Warning)
- Product details show specific health warnings
- Smart filtering hides incompatible products

---

## 🚀 Next Steps Beyond This Plan

1. **Advanced Ingredient Analysis**
   - Integrate EWG database for safety ratings
   - DrugBank API for medication interactions
   
2. **Personalized Recommendations**
   - AI suggests alternative safe products
   - Learn from user preferences
   
3. **Mobile App**
   - Native iOS/Android with React Native
   - Push notifications for expiring products
   
4. **Social Features**
   - Share safe products with friends
   - Community reviews

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Gemini AI**: https://ai.google.dev/docs
- **Cursor IDE**: https://cursor.sh/docs

---

## ✅ Summary

Your **Tend+** project has a solid foundation with authentication, database, and basic AI features. The expansion plan adds:

1. **Conversational AI** for easier health data input
2. **Automatic ingredient storage** from OCR scans
3. **Smart product filtering** based on user health profiles
4. **Real-time compatibility warnings** on product pages

This will transform Tend+ from a basic product catalog into an intelligent, personalized health shopping assistant!

**Estimated Total Development Time**: 2-3 weeks (working part-time)

Good luck with your expansion! 🚀