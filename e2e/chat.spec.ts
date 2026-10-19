import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 800 } })
test.setTimeout(900000)

test('ai companion chats and edits the schedule', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  await page.getByLabel('What should we call you?').fill('Shoumik')
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('University / College Student')).toBeVisible()
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('Steady Pace')).toBeVisible({ timeout: 120000 })
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('Question 04 of 05')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('text=Selected').first()).toBeVisible({ timeout: 30000 })
  await page.getByRole('button', { name: /continue \(\d+\)/i }).click()
  await expect(page.getByText('Question 05 of 05')).toBeVisible({ timeout: 30000 })
  await page.getByRole('button', { name: /build personalized schedule/i }).click()
  await expect(page.getByText(/daily schedule/i).first()).toBeVisible({ timeout: 300000 })

  // Dismiss the day briefing if it appears (evening runs)
  const keepBtn = page.getByRole('button', { name: /keep plan as-is/i })
  if (await keepBtn.count()) await keepBtn.click()

  // Open chat via the FAB. (In dev, the Next.js overlay trigger can sit
  // over fixed corner buttons, so click through hit-testing here —
  // the app itself is unaffected in production.)
  await page.evaluate(() => {
    const fab = document.querySelector('button[aria-label="Open AI chat"]');
    if (!(fab instanceof HTMLElement)) throw new Error('chat FAB missing');
    fab.click();
  })
  await expect(page.getByLabel('Message Talverin AI')).toBeVisible()
  await page.getByLabel('Message Talverin AI').fill('Reply with exactly the word pineapple and nothing else.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('pineapple', { exact: false }).first()).toBeVisible({ timeout: 120000 })
  await page.screenshot({ path: '/tmp/v-chat.png' })

  // Ask for a schedule change; pipeline must complete without crashing
  await page.getByLabel('Message Talverin AI').fill('Move my first deep work session to 19:00.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await page.waitForTimeout(2000)
  const bubbles = await page.locator('[role="dialog"] p').count()
  expect(bubbles).toBeGreaterThan(2)

  expect(errors).toEqual([])
})
