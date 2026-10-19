import { test, expect } from '@playwright/test'

// Short viewport reproduces the reported stuck scroll on step 3.
test.use({ viewport: { width: 1280, height: 600 } })
// Live AI call on Q2->Q3 needs room beyond the default 30s.
test.setTimeout(150000)

test('step 3 capacity screen scrolls to its footer CTA', async ({ page }) => {
  await page.goto('/')

  // Q1 -> Q2
  await page.getByLabel('What should we call you?').fill('Shoumik')
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('University / College Student')).toBeVisible()
  await expect(page.getByText('University / College Student')).toBeVisible()

  // Q2 -> Q3 (API falls back to defaults locally, still advances).
  // NB: headings render word-per-span, so assert on an unsplit label.
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('Steady Pace')).toBeVisible({ timeout: 90000 })

  const scroller = page.getByTestId('onboarding-scroll')
  const metrics = await scroller.evaluate((el) => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    scrollTop: el.scrollTop,
  }))
  // Content taller than viewport: must be scrollable
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight)

  // Scroll to bottom and verify the footer CTA becomes visible
  await scroller.evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
  const after = await scroller.evaluate((el) => el.scrollTop)
  expect(after).toBeGreaterThan(metrics.scrollTop)

  await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
})
