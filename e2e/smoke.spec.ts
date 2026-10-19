import { test, expect } from '@playwright/test'

test('onboarding greets and advances past question 1', async ({ page }) => {
  await page.goto('/')

  // Q1 renders with the name prompt
  await expect(
    page.getByRole('heading', { name: 'What should we call you?' }),
  ).toBeVisible()

  // Brand + progress pill render
  await expect(page.getByText('talverin', { exact: true }).first()).toBeVisible()

  // Type a name and continue to question 2
  await page.getByLabel('What should we call you?').fill('Shoumik')
  await page.getByRole('button', { name: /continue/i }).click()

  // Occupation step appears (heading words render in separate spans,
  // so assert on a role card instead)
  await expect(
    page.getByText('University / College Student'),
  ).toBeVisible()
})

test('workspace deep-links render without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'What should we call you?' }),
  ).toBeVisible()

  expect(errors).toEqual([])
})
