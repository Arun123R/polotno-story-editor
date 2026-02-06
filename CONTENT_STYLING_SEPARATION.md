# Content/Styling Separation Implementation

## Overview
The editor has been refactored to strictly follow the backend's content/styling separation contract.

---

## Backend Contract (STRICT)

### Request Format
- **Type**: `multipart/form-data`
- **Do NOT**: Send JSON body or manually set Content-Type

### Required Fields

#### Core
```javascript
parent: string        // storyGroupId
order: number         // slide order
```

#### Content (Semantic/Business Data)
Sent as **stringified JSON**:
```javascript
content = {
  "link": "",
  "button_text": "",
  "image": null,      // Binary uploaded separately
  "video": null       // Binary uploaded separately
}
```

#### Styling (UI/Presentation Data)
Sent as **stringified JSON**:
```javascript
styling = {
  "fullWidthCta": 0,
  "rdrType": "url",
  "pc_redirect_type": "url",
  "cta": { ... }      // CTA styling object
}
```

#### Media (Binary)
```javascript
image: File | ""      // Binary file upload
video: File | ""      // Binary file upload
```

---

## Implementation

### 1. Save Flow (`utils/canvasSave.js`)

```javascript
export const handleSave = async (options) => {
    const { groupId, slideId, contentData, stylingData } = options;
    
    const formData = new FormData();
    
    // Core fields
    formData.append("parent", String(groupId));
    formData.append("order", String(contentData.order || 1));
    
    // CONTENT (semantic) - JSON string
    const content = {
        link: contentData.link || "",
        button_text: contentData.buttonText || "",
        image: null,  // Binary uploaded separately
        video: null,
    };
    formData.append("content", JSON.stringify(content));
    
    // STYLING (presentation) - JSON string
    const styling = {
        fullWidthCta: stylingData.fullWidthCta ? 1 : 0,
        rdrType: stylingData.rdrType || "url",
        pc_redirect_type: stylingData.pc_redirect_type || "url",
        cta: stylingData.cta || {},
    };
    formData.append("styling", JSON.stringify(styling));
    
    // MEDIA - Binary
    const imageFile = await exportCanvasAsImage(store);
    formData.append("image", imageFile);
    formData.append("video", "");
    
    // Send to backend
    return await storyAPI.updateStorySlide(formData);
};
```

### 2. Hydration Flow (`hooks/useSlideHydration.js`)

```javascript
// Backend returns: { content: {...}, styling: {...} }

// Parse content (semantic)
const contentObj = JSON.parse(slideData.content);

// Parse styling (presentation)
const stylingObj = JSON.parse(slideData.styling);

// Map to editor state
setCtaState({
    // From CONTENT
    link: contentObj.link || '',
    buttonText: contentObj.button_text || '',
    image: contentObj.image || null,
    video: contentObj.video || null,
    
    // From STYLING
    styling: stylingObj,
    fullWidthCta: stylingObj.fullWidthCta === 1,
    rdrType: stylingObj.rdrType || 'url',
    pc_redirect_type: stylingObj.pc_redirect_type || 'url',
    cta: stylingObj.cta || {},
});
```

### 3. Topbar Integration (`editor/Topbar.jsx`)

```javascript
const handleSaveClick = async () => {
    await handleSave({
        store,
        groupId,
        slideId,
        
        // CONTENT: Semantic/business data
        contentData: {
            order: 1,
            link: ctaState?.link || '',
            buttonText: ctaState?.buttonText || '',
        },
        
        // STYLING: UI/presentation data
        stylingData: {
            fullWidthCta: ctaState?.fullWidthCta || false,
            rdrType: ctaState?.rdrType || 'url',
            pc_redirect_type: ctaState?.pc_redirect_type || 'url',
            cta: ctaState?.cta || {},
        },
    });
};
```

---

## Key Rules

### ✅ DO
- Send `content` as stringified JSON
- Send `styling` as stringified JSON
- Upload `image` and `video` as binary files
- Keep content and styling separate in editor state
- Use FormData for all requests

### ❌ DO NOT
- Send `canvasData` to backend
- Mix content fields into styling
- Mix styling fields into content
- Send editor-specific state
- Manually set Content-Type header

---

## Data Flow

```
SAVE:
Editor State → contentData + stylingData → FormData → Backend

LOAD:
Backend → { content, styling } → Parse → Editor State
```

---

## Files Modified

1. **`src/utils/canvasSave.js`**
   - Refactored `handleSave` to use content/styling separation
   - Removed `canvasData` from backend payload
   - Added proper FormData construction

2. **`src/hooks/useSlideHydration.js`**
   - Updated hydration to parse `content` and `styling` separately
   - Maps backend structure to editor state correctly

3. **`src/editor/Topbar.jsx`**
   - Updated save call to use `contentData` and `stylingData`
   - Removed old `slideMetadata` structure

---

## Testing Checklist

- [ ] Save creates slide with correct content/styling split
- [ ] Update preserves content/styling separation
- [ ] Load correctly maps backend data to editor
- [ ] No `canvasData` sent to backend
- [ ] Image uploads as binary
- [ ] FormData structure matches dashboard
