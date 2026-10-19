import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 800 } })
test.setTimeout(600000)

test('workspace timeline column scrolls end to end', async ({ page }) => {
  await page.goto('/')

  // Q1 -> Q2
  await page.getByLabel('What should we call you?').fill('Shoumik')
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('University / College Student')).toBeVisible()

  // Q2 -> Q3 (live AI)
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('Steady Pace')).toBeVisible({ timeout: 120000 })

  // Q3 -> Q4 (heading words render per-span; assert the badge + a goal card)
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('Question 04 of 05')).toBeVisible({ timeout: 30000 })

  // Q4 -> Q5 (pick first two goal cards)
  const goalCards = page.locator('text=Selected')
  await expect(goalCards.first()).toBeVisible({ timeout: 30000 })
  await page.getByRole('button', { name: /continue \(\d+\)/i }).click()
  await expect(page.getByText('Question 05 of 05')).toBeVisible({ timeout: 30000 })

  // Q5 -> workspace (live AI research + plan build)
  await page.getByRole('button', { name: /build personalized schedule/i }).click()
  await expect(page.getByText(/daily schedule/i).first()).toBeVisible({ timeout: 300000 })

  // Measure the center column
  const metrics = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return null
    const cards = main.querySelectorAll(':scope > div:last-child, :scope div')
    return {
      scrollHeight: main.scrollHeight,
      clientHeight: main.clientHeight,
      overflowY: getComputedStyle(main).overflowY,
      display: getComputedStyle(main).display,
      cards: cards.length,
    }
  })
  console.log(JSON.stringify(metrics))
  expect(metrics).not.toBeNull()
  expect(metrics!.scrollHeight).toBeGreaterThan(metrics!.clientHeight)

  const main = page.locator('main')
  await main.evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
  expect(await main.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
})
