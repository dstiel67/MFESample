# Error Boundary Testing Guide

This document describes how to test the error boundary and fallback UI implementation.

## Test Scenarios

### 1. MFE Loading Failure

**Test:** Load MFE1 when it's not running

**Steps:**
1. Ensure MFE1 is NOT running on port 4201
2. Start the shell: `npm run dev`
3. Navigate to http://localhost:4200
4. Click on "MFE1 Dashboard" in the navigation

**Expected Result:**
- Error boundary should display with:
  - Error icon (⚠️)
  - Title: "Unable to Load mfe1"
  - User-friendly error message
  - "Try Again" button
  - "Go to Home" button
  - Expandable "Technical Details" section with error stack
- Shell navigation should remain functional
- Clicking "Go to Home" should navigate back to home page
- Clicking "Try Again" should attempt to reload the MFE

### 2. MFE Loading Success After Retry

**Test:** Retry loading MFE1 after starting it

**Steps:**
1. Follow steps from Test 1 to trigger the error
2. Start MFE1: `cd mfe1 && npm start`
3. Click the "Try Again" button in the error boundary

**Expected Result:**
- Loading spinner should appear
- MFE1 should load successfully
- Error boundary should be replaced with MFE1 content

### 3. Navigation Error Recovery

**Test:** Navigate to invalid route

**Steps:**
1. Start the shell: `npm run dev`
2. Manually navigate to http://localhost:4200/invalid-route

**Expected Result:**
- Shell should automatically redirect to home page
- No error should be displayed
- Console should show warning about route not found

### 4. Global Error Handler

**Test:** Unhandled promise rejection

**Steps:**
1. Start the shell: `npm run dev`
2. Open browser console
3. Execute: `Promise.reject(new Error('Test error'))`

**Expected Result:**
- Error notification toast should appear in top-right corner
- Toast should show "An unexpected error occurred"
- Toast should auto-dismiss after 5 seconds
- Toast should have a close button (×)
- Shell should remain functional

### 5. Error Details Expansion

**Test:** View technical error details

**Steps:**
1. Trigger any error (e.g., MFE loading failure)
2. Click on "Technical Details" in the error boundary

**Expected Result:**
- Details section should expand
- Should show:
  - Error message in monospace font
  - Context information
  - Stack trace (if available)
- Details should be collapsible

### 6. Mobile Responsiveness

**Test:** Error boundary on mobile devices

**Steps:**
1. Start the shell: `npm run dev`
2. Trigger an error (e.g., MFE loading failure)
3. Open browser DevTools and switch to mobile view (e.g., iPhone)

**Expected Result:**
- Error boundary should be responsive
- Buttons should stack vertically
- Text should be readable
- Error notification should span full width with margins

### 7. Shell Stability

**Test:** Shell remains functional after errors

**Steps:**
1. Trigger multiple errors in sequence:
   - Try to load MFE1 when it's not running
   - Navigate to home
   - Try to load MFE1 again
   - Navigate to home again

**Expected Result:**
- Shell should remain stable throughout
- Navigation should always work
- No console errors about broken state
- Each error should be properly displayed and cleared

## Manual Testing Checklist

- [ ] MFE loading failure displays error boundary
- [ ] Error boundary shows user-friendly message
- [ ] "Try Again" button works
- [ ] "Go to Home" button works
- [ ] Technical details are expandable
- [ ] Error notification toast appears for unhandled errors
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Toast close button works
- [ ] Shell navigation remains functional after errors
- [ ] Invalid routes redirect to home
- [ ] Error boundary is responsive on mobile
- [ ] Multiple errors don't break the shell
- [ ] Retry after fixing the issue works

## Automated Testing (Future)

The following property-based tests should be implemented:

1. **Property 4: MFE loading error handling**
   - For any MFE load failure, shell should remain functional
   - Error message should be displayed
   - Navigation should still work

2. **Error Recovery Property**
   - For any error state, user should be able to navigate back to home
   - Shell should never enter an unrecoverable state

## Notes

- All errors are logged to console for debugging
- Error boundaries catch errors at different levels:
  - Global: `setupGlobalErrorHandler()` catches unhandled errors
  - Route: `withErrorBoundary()` wraps route handlers
  - MFE: `mfeLoader._displayError()` handles MFE-specific errors
- The shell prioritizes stability over showing errors - it will always try to recover
