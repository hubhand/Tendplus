# CURSOR IMPLEMENTATION PROMPT FOR TEND+ EXPANSION

## 📋 CONTEXT
I'm implementing an AI chatbot system for my Tend+ health shopping platform. The chatbot will:
1. Extract health information (allergies, medications, etc.) from user conversations
2. Store extracted ingredients from product scans into the database
3. Filter products based on user health profiles

I have already read the file `Tendplus_analysis_and_expansion_plan.MD` which contains the complete architecture analysis.

---

## 🎯 PHASE 1: AI CHATBOT IMPLEMENTATION (Days 1-5)

### STEP 1: Create HealthChatbot Component (Day 1)

**ACTION**: Create a new file
**PATH**: `src/components/health/HealthChatbot.tsx`

**INSTRUCTIONS FOR CURSOR**:
```
Create a React component called HealthChatbot with the following requirements:
- Display a chat interface with message history
- Messages should have two roles: 'user' and 'assistant'
- User messages should appear on the right with emerald-600 background
- Assistant messages should appear on the left with gray-100 background
- Include a text input at the bottom with a send button
- Show "AI가 응답 중..." loading state when processing
- Messages should have timestamps (use Date type)
- Input should send on Enter key press
- Send button should be disabled when input is empty or loading
- Use TypeScript with proper interfaces
- Make POST request to '/api/health-chat' endpoint
- Handle errors gracefully with console.error
- Style with Tailwind CSS matching the existing Tend+ design

The component should be a client component ('use client').
Message interface should include: id (string), role ('user' | 'assistant'), content (string), timestamp (Date).
```

**EXPECTED FILE STRUCTURE**:
```typescript
'use client';

import { useState } from 'react';

interface Message {
  // ... define interface
}

export function HealthChatbot() {
  // ... implementation
}
```

---

### STEP 2: Create Health Chat API Route (Day 2)

**ACTION**: Create a new file
**PATH**: `src/app/api/health-chat/route.ts`

**INSTRUCTIONS FOR CURSOR**:
```
Create a Next.js API route handler that:
1. Authenticates the user using getCurrentUserId from '@/lib/supabase/server'
2. Returns 401 if not authenticated
3. Receives a message from the request body
4. Fetches the user's current health_profile from Supabase
5. Creates a context-aware prompt for Gemini AI that includes:
   - System role: Health information collection assistant
   - Current user's health data (allergies, medications, skin_concerns, chronic_conditions, blacklist_ingredients)
   - Instructions to extract new health information from user message
   - Return format as JSON with structure:
     {
       "extracted_data": {
         "allergies": [],
         "medications": [],
         "skin_concerns": [],
         "chronic_conditions": [],
         "blacklist_ingredients": []
       },
       "reply": "friendly response in Korean"
     }
6. Call Gemini 2.0 Flash model using GoogleGenerativeAI
7. Parse the JSON response from the AI
8. If extracted_data exists, merge it with existing health profile:
   - Decrypt existing fields using decrypt() from '@/lib/security/encryption'
   - Combine new and existing arrays, remove duplicates
   - Encrypt updated fields using encrypt()
   - Update health_profiles table with new data
9. Return the AI's reply message
10. Handle errors and return appropriate 500 status

Use: 
- import { GoogleGenerativeAI } from '@google/generative-ai'
- import { getCurrentUserId, createClient } from '@/lib/supabase/server'
- import { encrypt, decrypt } from '@/lib/security/encryption'
- Use GEMINI_API_KEY from environment
- Model: 'gemini-2.0-flash-exp'
```

**EXPECTED FILE STRUCTURE**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
// ... other imports

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  // ... implementation
}
```

---

### STEP 3: Integrate Chatbot into Health Page (Day 3)

**ACTION**: Modify existing file
**PATH**: `src/app/health/page.tsx`

**INSTRUCTIONS FOR CURSOR**:
```
Modify the existing HealthPage component to add chatbot functionality:

1. Add import at the top:
   import { HealthChatbot } from '@/components/health/HealthChatbot';

2. Add new state for tab switching:
   const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');

3. Before the form section (around line 147), add tab navigation:
   - Create a flex container with gap-4 and border-b
   - Two buttons: "직접 입력" and "AI 채팅으로 입력"
   - Active tab should have border-b-2 border-emerald-600
   - Buttons should update activeTab state onClick

4. Wrap the existing form in a conditional:
   {activeTab === 'form' ? (
     <form onSubmit={handleSubmit}>
       {/* existing form code - DO NOT MODIFY */}
     </form>
   ) : (
     <HealthChatbot />
   )}

5. Keep all existing functionality intact:
   - Don't modify any existing state variables
   - Don't change the form submission logic
   - Don't alter loading, error, or saved states

IMPORTANT: Only add the tab switching UI and conditional rendering. Do not remove or modify any existing form code.
```

---

### STEP 4: Test Phase 1 (Day 4-5)

**MANUAL TESTING STEPS** (Tell Cursor to add console.logs for debugging):

```
Add debugging to health-chat API route:

At the start of POST function:
console.log('Health chat API called with message:', message);

After fetching profile:
console.log('User profile:', { 
  hasAllergies: !!profile?.allergies,
  hasMedications: !!profile?.medications 
});

After AI response:
console.log('AI response:', { hasReply: !!parsed.reply, extractedData: parsed.extracted_data });

After database update:
console.log('Profile updated successfully');

This will help debug the flow in browser console and terminal.
```

**TEST CHECKLIST**:
- [ ] Health page shows two tabs: "직접 입력" and "AI 채팅으로 입력"
- [ ] Clicking tabs switches between form and chatbot
- [ ] Chatbot displays empty message list initially
- [ ] Can type and send messages
- [ ] AI responds within a few seconds
- [ ] Messages appear with correct styling (user=right, AI=left)
- [ ] Try: "저는 땅콩 알러지가 있어요"
- [ ] Check Supabase health_profiles table - allergies field should update
- [ ] Try: "아스피린을 복용하고 있습니다"
- [ ] Check again - medications field should update

---

## 🎯 PHASE 2: INGREDIENT STORAGE (Days 6-10)

### STEP 5: Create Ingredient Analyzer Service (Day 6)

**ACTION**: Create new file
**PATH**: `src/lib/services/ingredient-analyzer.ts`

**INSTRUCTIONS FOR CURSOR**:
```
Create a TypeScript service module that exports a function to check product compatibility with user health profiles.

Requirements:
1. Create interfaces:
   - HealthProfile with arrays: allergies, medications, blacklist_ingredients
   - CompatibilityResult with: compatible (boolean), warnings (string[]), concerns (array of objects)
   - Concern object: type ('allergy' | 'medication' | 'blacklist'), ingredient (string), reason (string)

2. Export async function: checkProductCompatibility(productId: string, userId: string)

3. Function logic:
   - Create Supabase client using createClient from '@/lib/supabase/server'
   - Fetch user's health_profile (allergies, medications, blacklist_ingredients only)
   - If no profile, return { compatible: true, warnings: [], concerns: [] }
   - Decrypt all health fields using decrypt() from '@/lib/security/encryption'
   - Fetch product ingredients using:
     SELECT product_ingredients.ingredient_id, 
            ingredients.name_ko, 
            ingredients.name_en, 
            ingredients.allergens
     FROM product_ingredients
     JOIN ingredients ON product_ingredients.ingredient_id = ingredients.id
     WHERE product_ingredients.product_id = productId
   - If no ingredients, return compatible: true
   - Loop through each ingredient and check:
     a. Does ingredient name contain any allergy? → Add to concerns (type: 'allergy')
     b. Does ingredient name contain any blacklisted ingredient? → Add to concerns (type: 'blacklist')
   - For each concern, add a warning message (e.g., "⚠️ 알러지 주의: 땅콩")
   - Return result with compatible = (concerns.length === 0)

4. Use case-insensitive matching with .toLowerCase()

Import:
- createClient from '@/lib/supabase/server'
- decrypt from '@/lib/security/encryption'

IMPORTANT: This is a server-side only module. Do not add 'use client'.
```

---

### STEP 6: Update OCR API to Save Ingredients (Day 7-8)

**ACTION**: Modify existing file
**PATH**: `src/app/api/ai/ocr/route.ts`

**INSTRUCTIONS FOR CURSOR**:
```
Modify the OCR API route to save extracted ingredients to the database.

After line 66 (after successful OCR and data extraction), add this logic:

1. Create Supabase client: const supabase = await createClient();

2. Create or find product:
   - Insert into products table: { name: data.product_name, category: 'scanned' }
   - Use .select() and .single() to get the created product
   - Handle error if insert fails

3. If product was created and data.ingredients_list exists:
   - Loop through each ingredient in the list (use index for position)
   - For each ingredient:
     a. Normalize the name:
        - Convert to lowercase
        - Remove all non-Korean, non-English, non-numeric characters
        - Remove all whitespace
        Example: "땅콩 (Peanut)" → "땅콩peanut"
     
     b. Check if ingredient exists in ingredients table:
        - Query by name_ko_normalized
        - Use .maybeSingle() to get result or null
     
     c. If ingredient doesn't exist:
        - Insert into ingredients table: { name_ko: originalName }
        - Get the newly created ingredient
     
     d. Link ingredient to product:
        - Insert into product_ingredients table:
          { product_id, ingredient_id, position: index + 1 }
        - Use .onConflict('product_id,ingredient_id') to avoid duplicates
        - Use .ignore() to skip if already exists

4. After ingredient processing, save scan_history:
   - Insert: { user_id: userId, product_id, ocr_result: data, confidence: data.confidence }

5. Wrap the entire ingredient saving logic in try-catch
   - Log errors but don't fail the entire OCR request
   - Still return success response to user

6. Add debug logging:
   console.log('Created product:', product.id);
   console.log('Processing ingredients:', data.ingredients_list.length);
   console.log('Ingredient saved:', ingredientName);

Keep the existing response structure. Only add the database saving logic BEFORE the return statement.
```

---

### STEP 7: Test Phase 2 (Day 9-10)

**MANUAL TESTING STEPS**:

```
Test ingredient storage:

1. Go to /scan page
2. Click "사진으로 촬영" or use manual input
3. Enter test data:
   Product name: "테스트 로션"
   Ingredients: "정제수, 글리세린, 부틸렌글라이콜, 땅콩오일"
4. Submit and check response
5. Open Supabase dashboard:
   - Go to products table → Should see "테스트 로션"
   - Go to ingredients table → Should see 4 new ingredients
   - Go to product_ingredients table → Should see 4 links
   - Go to scan_history → Should see the scan record

6. Scan another product with overlapping ingredients:
   Product: "테스트 크림"
   Ingredients: "정제수, 시어버터, 땅콩오일"
7. Check Supabase:
   - products: 2 products total
   - ingredients: 5 ingredients (정제수, 글리세린, 부틸렌글라이콜, 땅콩오일, 시어버터)
   - product_ingredients: 7 links total

Verify no duplicate ingredients were created (name_ko_normalized prevents this).
```

**ADD TO CURSOR**:
```
Add error handling improvements to OCR route:

1. Before the ingredient saving loop:
   if (!supabase) {
     console.error('Supabase client not initialized');
     return Response.json({ success: true, data }); // Still return success to user
   }

2. Wrap each database operation in try-catch:
   try {
     const { data: ingredient, error } = await supabase.from('ingredients')...
     if (error) {
       console.error('Ingredient insert error:', error);
       continue; // Skip this ingredient, continue with next
     }
   } catch (err) {
     console.error('Unexpected error:', err);
     continue;
   }

This ensures OCR always succeeds even if database has issues.
```

---

## 🎯 PHASE 3: SMART PRODUCT FILTERING (Days 11-15)

### STEP 8: Update Products List Page (Day 11-12)

**ACTION**: Modify existing file
**PATH**: `src/app/products/page.tsx`

**INSTRUCTIONS FOR CURSOR**:
```
Transform the products page to show health compatibility information.

Changes needed:

1. Add imports at top:
   import { getCurrentUserId } from '@/lib/supabase/server';
   import { checkProductCompatibility } from '@/lib/services/ingredient-analyzer';
   import { useState } from 'react'; // Move to client component

2. Convert to client component:
   - Remove 'export const metadata'
   - Add 'use client' at top
   - Move data fetching to useEffect

3. Add state for filtering:
   const [filter, setFilter] = useState<'all' | 'safe' | 'warning'>('all');
   const [products, setProducts] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

4. Create useEffect for data fetching:
   - Fetch products from Supabase
   - Get userId (if logged in)
   - If userId exists, call checkProductCompatibility for each product
   - Attach compatibility data to each product: { ...product, compatible, warnings }
   - setProducts with enriched data

5. Add filter controls before the product grid:
   <div className="mb-6 flex gap-4">
     <button 
       onClick={() => setFilter('all')}
       className={filter === 'all' ? 'border-b-2 border-emerald-600' : ''}
     >
       모든 제품 ({products.length})
     </button>
     <button 
       onClick={() => setFilter('safe')}
       className={filter === 'safe' ? 'border-b-2 border-emerald-600' : ''}
     >
       ✅ 안전한 제품 ({safeCount})
     </button>
     <button 
       onClick={() => setFilter('warning')}
       className={filter === 'warning' ? 'border-b-2 border-yellow-600' : ''}
     >
       ⚠️ 주의 필요 ({warningCount})
     </button>
   </div>

6. Filter products based on active filter:
   const filteredProducts = products.filter(p => {
     if (filter === 'safe') return p.compatible;
     if (filter === 'warning') return !p.compatible;
     return true;
   });

7. In product card rendering:
   - Add compatibility badge to each card (top-right corner)
   - If !product.compatible, show: ⚠️ 주의 (red badge)
   - If product.compatible, show: ✅ 안전 (green badge)

8. Map over filteredProducts instead of products

Keep all existing styling. Only add the filtering logic and badges.
```

**ALTERNATIVE APPROACH** (if above is too complex):
```
Actually, let me suggest a simpler approach that keeps it as a server component:

MODIFY src/app/products/page.tsx:

1. Keep as server component (no 'use client')
2. Keep existing metadata export
3. After fetching products (line 15), add:
   
   const userId = await getCurrentUserId();
   
   if (userId && products) {
     const enriched = await Promise.all(
       products.map(async (product) => {
         const compatibility = await checkProductCompatibility(product.id, userId);
         return { 
           ...product, 
           compatible: compatibility.compatible,
           warningCount: compatibility.concerns.length 
         };
       })
     );
     products = enriched;
   }

4. In the product card (around line 82), add after the image div:
   
   {product.compatible === false && (
     <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
       ⚠️ 주의
     </div>
   )}
   {product.compatible === true && (
     <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
       ✅ 안전
     </div>
   )}

This keeps it simple and server-rendered. Choose this approach if the first one seems too complex.
```

---

### STEP 9: Update Product Detail Page (Day 13-14)

**ACTION**: Modify existing file
**PATH**: `src/app/products/[id]/page.tsx`

**INSTRUCTIONS FOR CURSOR**:
```
Enhance the product detail page to show ingredient analysis and compatibility warnings.

Changes:

1. Add imports:
   import { getCurrentUserId } from '@/lib/supabase/server';
   import { checkProductCompatibility } from '@/lib/services/ingredient-analyzer';

2. Modify the Supabase query (around line 20) to include ingredients:
   Change the select() to:
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

3. After fetching product, add:
   const userId = await getCurrentUserId();
   let compatibility = null;
   
   if (userId) {
     compatibility = await checkProductCompatibility(id, userId);
   }

4. In the render section, after the product title, add compatibility alerts:

   {/* Compatibility Warning */}
   {compatibility && !compatibility.compatible && (
     <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
       <h3 className="font-bold text-red-800 mb-2">⚠️ 건강 프로필 주의사항</h3>
       <ul className="space-y-1">
         {compatibility.concerns.map((concern, i) => (
           <li key={i} className="text-red-700 text-sm">
             • {concern.ingredient}: {concern.reason}
           </li>
         ))}
       </ul>
     </div>
   )}
   
   {/* Compatibility Success */}
   {compatibility && compatibility.compatible && (
     <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
       <p className="text-green-800">
         ✅ 이 제품은 회원님의 건강 프로필과 호환됩니다
       </p>
     </div>
   )}

5. Add ingredients section before closing main tag:

   {/* Ingredients List */}
   {product.product_ingredients && product.product_ingredients.length > 0 && (
     <div className="mt-8 border-t pt-8">
       <h2 className="text-xl font-bold mb-4">성분 목록</h2>
       <ul className="space-y-2">
         {product.product_ingredients
           .sort((a, b) => a.position - b.position)
           .map((pi) => (
             <li key={pi.ingredient_id} className="flex items-start gap-3">
               <span className="text-zinc-500 min-w-[2rem]">{pi.position}.</span>
               <div>
                 <span className="font-medium">{pi.ingredients.name_ko}</span>
                 {pi.ingredients.name_en && (
                   <span className="text-sm text-zinc-500 ml-2">
                     ({pi.ingredients.name_en})
                   </span>
                 )}
                 {pi.amount && (
                   <span className="text-sm text-zinc-400 ml-2">- {pi.amount}</span>
                 )}
               </div>
             </li>
           ))}
       </ul>
     </div>
   )}

Keep all existing product information display. Only add compatibility section and ingredients list.
```

---

### STEP 10: Final Testing (Day 15)

**COMPREHENSIVE TEST PLAN**:

```
End-to-End Testing Checklist:

SETUP:
1. Create test health profile:
   - Go to /health
   - Add allergies: "땅콩, 대두"
   - Add blacklist: "파라벤, 알코올"
   - Save

2. Create test products:
   - Scan Product A: "안전 로션" with ingredients: "정제수, 글리세린, 시어버터"
   - Scan Product B: "위험 크림" with ingredients: "정제수, 땅콩오일, 파라벤"
   - Scan Product C: "부분위험 세럼" with ingredients: "정제수, 대두추출물, 히알루론산"

TEST FLOWS:

1. Chatbot Test:
   - Go to /health → AI 채팅 tab
   - Message: "저는 우유 알러지도 있어요"
   - Verify AI responds and adds "우유" to allergies
   - Check Supabase: allergies should now be ["땅콩", "대두", "우유"]

2. Product Filtering Test:
   - Go to /products
   - Should see 3 products with badges:
     • Product A: ✅ 안전
     • Product B: ⚠️ 주의
     • Product C: ⚠️ 주의
   - Click "안전한 제품" filter → Only Product A shows
   - Click "주의 필요" filter → Products B and C show

3. Product Detail Test:
   - Click Product A → Should show green "호환됩니다" message
   - Should show ingredient list: 정제수, 글리세린, 시어버터
   - Click Product B → Should show red warning box
   - Warning should list: "땅콩오일: 땅콩 알러지 성분 포함" and "파라벤: 피해야 할 성분"
   - Should show full ingredient list

4. OCR Integration Test:
   - Go to /scan
   - Take photo or manual input of real product
   - Verify ingredients appear in result
   - Check Supabase: product_ingredients table populated
   - Go back to /products → New product should appear with compatibility badge

5. Performance Test:
   - Add 10+ products via scanning
   - Go to /products → Should load within 2-3 seconds
   - Click filters → Should respond instantly
   - Ingredient analysis should not slow down page load significantly

EXPECTED RESULTS:
✅ All features work end-to-end
✅ Database properly stores products, ingredients, and links
✅ Compatibility checking correctly identifies issues
✅ UI clearly shows safe vs warning products
✅ No console errors
✅ Responsive design works on mobile
```

---

## 🔧 DEBUGGING TIPS FOR CURSOR

### Common Issues and Fixes:

**Issue 1: "getCurrentUserId is not a function"**
```
Make sure the import path is correct:
import { getCurrentUserId } from '@/lib/supabase/server';

Check that src/lib/supabase/server.ts exists and exports this function.
If not, you may need to copy the getCurrentUserId function from the analysis document.
```

**Issue 2: "encrypt is not defined"**
```
Add to src/lib/security/encryption.ts:

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export function decrypt(text: string): string {
  const [ivHex, encrypted, authTagHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

Also add to .env.local:
ENCRYPTION_KEY=your-64-character-hex-key

Generate key with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

**Issue 3: "Supabase query returns empty product_ingredients"**
```
The join syntax needs to be exact. Use:

const { data } = await supabase
  .from('product_ingredients')
  .select('ingredient_id, ingredients!inner(name_ko, name_en)')
  .eq('product_id', productId);

Note the !inner which forces the join. Without it, products without ingredients return null.
```

**Issue 4: "Module not found: Can't resolve '@/lib/services/ingredient-analyzer'"**
```
Make sure the file exists at: src/lib/services/ingredient-analyzer.ts

If it doesn't exist, create the directory first:
mkdir -p src/lib/services

Then create the file with the export:
export async function checkProductCompatibility(...) { ... }
```

**Issue 5: "GEMINI_API_KEY is not defined"**
```
Check your .env.local file has:
GEMINI_API_KEY=your_gemini_api_key

Restart the dev server after adding:
pnpm dev
```

---

## 📝 FINAL CHECKLIST

Before marking complete, verify:

### Phase 1: Chatbot
- [ ] `src/components/health/HealthChatbot.tsx` exists
- [ ] `src/app/api/health-chat/route.ts` exists
- [ ] Health page has tab switching
- [ ] Can send messages and get AI responses
- [ ] Health profile updates in Supabase

### Phase 2: Ingredients
- [ ] `src/lib/services/ingredient-analyzer.ts` exists
- [ ] OCR saves to products, ingredients, product_ingredients tables
- [ ] No duplicate ingredients created
- [ ] scan_history records each scan

### Phase 3: Filtering
- [ ] Products page shows compatibility badges
- [ ] Product detail shows warnings for incompatible items
- [ ] Product detail shows full ingredient list
- [ ] Compatibility checking works correctly

### Environment
- [ ] `.env.local` has all required keys:
  - GEMINI_API_KEY
  - ENCRYPTION_KEY
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - CLERK_SECRET_KEY
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

### Database
- [ ] Supabase tables exist: users_profile, health_profiles, products, ingredients, product_ingredients, scan_history
- [ ] RLS policies are enabled
- [ ] Can query tables from Supabase dashboard

---

## 🚀 DEPLOYMENT CHECKLIST

When ready to deploy to production:

1. **Environment Variables**:
   - Add all .env.local variables to Vercel/hosting platform
   - Generate new ENCRYPTION_KEY for production (don't reuse dev key)

2. **Supabase**:
   - Verify RLS policies are active
   - Check all indexes are created
   - Run VACUUM ANALYZE on tables

3. **Testing**:
   - Test on mobile devices
   - Test with real user accounts
   - Load test with 100+ products

4. **Monitoring**:
   - Set up error tracking (Sentry)
   - Monitor API rate limits
   - Check Supabase query performance

5. **Documentation**:
   - Update README with new features
   - Document the chatbot prompts
   - Add troubleshooting guide for users

---

## 💬 HOW TO USE THIS PROMPT IN CURSOR

1. **Copy Section-by-Section**: Don't paste the entire document at once
2. **Start with Phase 1, Step 1**: Copy just the Step 1 instructions
3. **Press Cmd/Ctrl + K**: Open Cursor AI command palette
4. **Paste the instructions**: Let Cursor generate the code
5. **Review the code**: Make sure it matches requirements
6. **Move to next step**: Repeat for each step

**Example for Step 1**:
```
1. Press Cmd+K
2. Paste: "Create a React component called HealthChatbot with the following requirements: [paste requirements from Step 1]"
3. Review generated component
4. Save file
5. Move to Step 2
```

---

## 📞 NEED HELP?

If you get stuck:

1. **Check the Error Message**: Copy the full error into Cursor AI
2. **Use Console Logs**: Add debugging console.log statements
3. **Check Supabase Dashboard**: Verify data is being saved
4. **Check Browser Console**: Look for JavaScript errors (F12)
5. **Check Terminal**: Look for API errors

**Common Cursor Commands**:
- `Cmd/Ctrl + K`: Generate/modify code
- `Cmd/Ctrl + L`: Chat with AI about code
- `Cmd/Ctrl + I`: Inline code generation
- `Cmd/Ctrl + Shift + P`: Command palette

Good luck! 🎉