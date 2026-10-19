import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 800 } })
test.setTimeout(900000)

const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const plusMin = (base: Date, mins: number) => hhmm(new Date(base.getTime() + mins * 60000))

test('alarms ring on start, chime on end, and catch up missed blocks', async ({ page }) => {
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

  // 1. Insert a deep-work slot starting NOW, ending in 2 minutes.
  const now = new Date()
  await page.getByRole('button', { name: /add slot/i }).click()
  await page.getByRole('button', { name: 'Goal Deep-Work' }).click()
  await page.getByLabel('Slot start time').fill(hhmm(now))
  await page.getByLabel('Slot end time').fill(plusMin(now, 2))
  await page.getByLabel('Slot title').fill('Alarm Probe Session')
  await page.getByRole('button', { name: 'Insert' }).click()

  // 2. Start alarm must ring inside the 2-minute window.
  await expect(page.getByText('Task Alarm Ringing')).toBeVisible({ timeout: 90000 })
  await page.getByRole('button', { name: /start focus session/i }).click()

  // 3. End chime + auto-DONE shortly after the 2-minute mark.
  await expect(page.getByText(/session ended — marked done/i).first()).toBeVisible({
    timeout: 240000,
  })

  // 4. Insert a fully-past deep-work slot -> catch-up MISSED + evening recovery.
  const past = new Date(Date.now() - 40 * 60000)
  await page.getByRole('button', { name: /add slot/i }).click()
  await page.getByRole('button', { name: 'Goal Deep-Work' }).click()
  await page.getByLabel('Slot start time').fill(hhmm(past))
  await page.getByLabel('Slot end time').fill(plusMin(past, 20))
  await page.getByLabel('Slot title').fill('Missed Probe Session')
  await page.getByRole('button', { name: 'Insert' }).click()
  await expect(page.getByText(/moved .* into your 21:30/i).first()).toBeVisible({ timeout: 90000 })

  expect(errors).toEqual([])
})
