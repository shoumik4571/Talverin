import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 800 } })
test.setTimeout(1200000)

const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const plusMin = (base: Date, mins: number) => hhmm(new Date(base.getTime() + mins * 60000))

// User report: AI said it added a course, roadmap showed nothing after refresh.
test('chat-added course survives a reload and shows in roadmap', async ({ page }) => {
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

  const keepBtn = page.getByRole('button', { name: /keep plan as-is/i })
  if (await keepBtn.count()) await keepBtn.click()

  // Ask the AI to ADD a session at a safely-future time.
  const now = new Date()
  const startMin = now.getHours() * 60 + now.getMinutes()
  const start = startMin > 22 * 60 ? plusMin(now, 10) : plusMin(now, 60)
  const end = startMin > 22 * 60 ? plusMin(now, 25) : plusMin(now, 90)
  await page.evaluate(() => {
    document.querySelector('button[aria-label="Open AI chat"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
  })
  await expect(page.getByLabel('Message Talverin AI')).toBeVisible({ timeout: 30000 })
  await page
    .getByLabel('Message Talverin AI')
    .fill(`Add a deep-work session titled exactly "UI UX Development Course" from ${start} to ${end}.`)
  await page.getByRole('button', { name: 'Send message' }).click()

  // The op must really apply (system note), not just be claimed in prose.
  await expect(page.getByText(/updated:.*added/i).first()).toBeVisible({ timeout: 180000 })

  // Visible in timeline AND in the 7-day roadmap.
  await page.getByRole('button', { name: 'Close AI chat' }).click()
  await expect(page.getByText('UI UX Development Course').first()).toBeVisible({ timeout: 30000 })
  await page.getByRole('button', { name: '7-Day Roadmap' }).click()
  await expect(page.getByText('UI UX Development Course').first()).toBeVisible({ timeout: 30000 })

  // Reload: session resumes straight into the workspace with the course intact.
  await page.reload()
  await expect(page.getByText(/daily schedule/i).first()).toBeVisible({ timeout: 60000 })
  const keep2 = page.getByRole('button', { name: /keep plan as-is/i })
  if (await keep2.count()) await keep2.click()
  await expect(page.getByText('UI UX Development Course').first()).toBeVisible({ timeout: 30000 })

  // Full app permissions: AI can change settings, not just blocks.
  await page.evaluate(() => {
    document.querySelector('button[aria-label="Open AI chat"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )
  })
  await expect(page.getByLabel('Message Talverin AI')).toBeVisible({ timeout: 30000 })
  await page.getByLabel('Message Talverin AI').fill('Set my wake time to 06:30.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText(/wake-up set to 06:30/i).first()).toBeVisible({ timeout: 180000 })

  expect(errors).toEqual([])
})
