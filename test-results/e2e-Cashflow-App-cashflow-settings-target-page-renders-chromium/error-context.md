# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Cashflow App >> cashflow settings (target) page renders
- Location: tests/e2e.spec.ts:222:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Target')
Expected: visible
Error: strict mode violation: getByText('Target') resolved to 8 elements:
    1) <a class="nav-link-active" href="/apps/cashflow/settings">…</a> aka getByRole('link', { name: 'Target' })
    2) <a href="/apps/cashflow/settings" class="nav-link-active shrink-0">Target</a> aka locator('header').getByText('Target')
    3) <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Target</h1> aka getByRole('heading', { name: 'Target' })
    4) <p class="text-sm text-zinc-500">Atur target tabungan dari total saldo Anda (selur…</p> aka getByText('Atur target tabungan dari')
    5) <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Target tabungan</div> aka getByText('Target tabungan', { exact: true })
    6) <label class="label">Target tabungan (Rp)</label> aka getByText('Target tabungan (Rp)')
    7) <p class="mt-1 text-xs text-zinc-500">Progress bar di dashboard muncul hanya saat targe…</p> aka getByText('Progress bar di dashboard')
    8) <button class="btn-primary">Simpan Target</button> aka getByRole('button', { name: 'Simpan Target' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Target')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]
  - alert [ref=e11]
  - generic [ref=e12]:
    - complementary [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: C
        - generic [ref=e16]: Cash Flow
      - navigation [ref=e17]:
        - link "Dashboard" [ref=e18] [cursor=pointer]:
          - /url: /apps/cashflow
        - link "Transaksi" [ref=e21] [cursor=pointer]:
          - /url: /apps/cashflow/transactions
        - link "Akun" [ref=e24] [cursor=pointer]:
          - /url: /apps/cashflow/accounts
        - link "Transfer" [ref=e27] [cursor=pointer]:
          - /url: /apps/cashflow/transfer
        - link "Target" [ref=e30] [cursor=pointer]:
          - /url: /apps/cashflow/settings
        - link "+ Catat Transaksi" [ref=e33] [cursor=pointer]:
          - /url: /apps/cashflow/transactions/new
      - generic [ref=e36]:
        - button "Toggle tema" [ref=e37] [cursor=pointer]: Mode gelap
        - link "Kembali ke platform" [ref=e40] [cursor=pointer]:
          - /url: /
    - main [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]:
          - heading "Target" [level=1] [ref=e47]
          - paragraph [ref=e48]: Atur target tabungan dari total saldo Anda (seluruh waktu).
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: Saldo saat ini
              - generic [ref=e53]: Rp 3.500.000
            - generic [ref=e54]:
              - generic [ref=e55]: Target tabungan
              - generic [ref=e56]: Rp 50.000.000
          - generic [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Target tabungan (Rp)
              - 'spinbutton "cth: 50000000" [ref=e60]': "50000000"
              - paragraph [ref=e61]: Progress bar di dashboard muncul hanya saat target diisi.
            - generic [ref=e62]:
              - button "Simpan Target" [ref=e63] [cursor=pointer]
              - button "Hapus Target" [ref=e64] [cursor=pointer]
```

# Test source

```ts
  124 |     await expect(page.getByText("Outreach Queue")).toBeVisible({ timeout: 10000 });
  125 |   });
  126 | 
  127 |   test("outreach prospects list renders", async ({ page }) => {
  128 |     await page.goto("/apps/outreach/prospects");
  129 |     await expect(page.getByText("Prospects")).toBeVisible({ timeout: 10000 });
  130 |     await expect(page.getByText("Export CSV")).toBeVisible();
  131 |   });
  132 | 
  133 |   test("outreach settings renders", async ({ page }) => {
  134 |     await page.goto("/apps/outreach/settings");
  135 |     await expect(page.getByText("Settings")).toBeVisible({ timeout: 10000 });
  136 |     await expect(page.getByText("Profil Bisnis")).toBeVisible();
  137 |   });
  138 | });
  139 | 
  140 | test.describe("Cashflow App", () => {
  141 |   test.beforeEach(async ({ page }) => {
  142 |     await mockPlatformAuth(page);
  143 |     await page.route("**/api/apps/cashflow/summary**", async (route) => {
  144 |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockCashflowSummary) });
  145 |     });
  146 |     await page.route("**/api/apps/cashflow/transactions**", async (route) => {
  147 |       if (route.request().method() === "GET") {
  148 |         await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTransactions) });
  149 |       } else {
  150 |         await route.continue();
  151 |       }
  152 |     });
  153 |     await page.route("**/api/apps/cashflow/accounts", async (route) => {
  154 |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockAccounts) });
  155 |     });
  156 |     await page.route("**/api/apps/cashflow/settings", async (route) => {
  157 |       if (route.request().method() === "GET") {
  158 |         await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockCashflowSettings) });
  159 |       } else {
  160 |         await route.continue();
  161 |       }
  162 |     });
  163 |   });
  164 | 
  165 |   test("cashflow dashboard renders with date range filter", async ({ page }) => {
  166 |     await page.goto("/apps/cashflow");
  167 |     await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
  168 |     // Check date range inputs exist (type date)
  169 |     const dateInputs = page.locator('input[type="date"]');
  170 |     await expect(dateInputs.first()).toBeVisible();
  171 |     await expect(dateInputs.nth(1)).toBeVisible();
  172 |     // Check presets including Bulan ini
  173 |     await expect(page.getByText("Hari ini")).toBeVisible();
  174 |     await expect(page.getByText("Kemarin")).toBeVisible();
  175 |     await expect(page.getByText("Bulan ini")).toBeVisible();
  176 |     await expect(page.getByText("Semua waktu")).toBeVisible();
  177 |     // Check stats cards
  178 |     await expect(page.getByText("Uang Masuk")).toBeVisible();
  179 |     await expect(page.getByText("Saldo per Akun")).toBeVisible();
  180 |     // Check target progress bar
  181 |     await expect(page.getByText("Target Tabungan")).toBeVisible();
  182 |   });
  183 | 
  184 |   test("cashflow dashboard date filter presets work", async ({ page }) => {
  185 |     await page.goto("/apps/cashflow");
  186 |     await page.waitForTimeout(1000);
  187 |     // Click Bulan ini
  188 |     await page.getByText("Bulan ini").click();
  189 |     const startInput = page.locator('input[type="date"]').first();
  190 |     const endInput = page.locator('input[type="date"]').nth(1);
  191 |     await expect(startInput).not.toHaveValue("");
  192 |     await expect(endInput).not.toHaveValue("");
  193 |     // Click Semua waktu to clear
  194 |     await page.getByText("Semua waktu").click();
  195 |     await expect(startInput).toHaveValue("");
  196 |     await expect(endInput).toHaveValue("");
  197 |   });
  198 | 
  199 |   test("cashflow transactions page has date range filter", async ({ page }) => {
  200 |     await page.goto("/apps/cashflow/transactions");
  201 |     await expect(page.getByText("Transaksi")).toBeVisible({ timeout: 10000 });
  202 |     // Should have two date inputs for start/end range
  203 |     const dateInputs = page.locator('input[type="date"]');
  204 |     await expect(dateInputs.first()).toBeVisible();
  205 |     await expect(dateInputs.nth(1)).toBeVisible();
  206 |     await expect(page.getByText("Semua tipe")).toBeVisible();
  207 |   });
  208 | 
  209 |   test("cashflow accounts page renders", async ({ page }) => {
  210 |     await page.goto("/apps/cashflow/accounts");
  211 |     await expect(page.getByText("Akun")).toBeVisible({ timeout: 10000 });
  212 |     await expect(page.getByText("Tambah Akun")).toBeVisible();
  213 |   });
  214 | 
  215 |   test("cashflow transfer page renders", async ({ page }) => {
  216 |     await page.goto("/apps/cashflow/transfer");
  217 |     await expect(page.getByText("Transfer")).toBeVisible({ timeout: 10000 });
  218 |     await expect(page.getByText("Dari akun")).toBeVisible();
  219 |     await expect(page.getByText("Ke akun")).toBeVisible();
  220 |   });
  221 | 
  222 |   test("cashflow settings (target) page renders", async ({ page }) => {
  223 |     await page.goto("/apps/cashflow/settings");
> 224 |     await expect(page.getByText("Target")).toBeVisible({ timeout: 10000 });
      |                                            ^ Error: expect(locator).toBeVisible() failed
  225 |     await expect(page.getByText("Target tabungan (Rp)")).toBeVisible();
  226 |     // Check delete button appears when target exists (mock has 50jt)
  227 |     // The page shows Hapus Target when targetAmount > 0
  228 |   });
  229 | 
  230 |   test("cashflow sidebar active state", async ({ page }) => {
  231 |     await page.goto("/apps/cashflow/transactions");
  232 |     await expect(page.locator('a.nav-link-active', { hasText: "Transaksi" })).toBeVisible({ timeout: 10000 });
  233 |     await page.goto("/apps/cashflow/accounts");
  234 |     await expect(page.locator('a.nav-link-active', { hasText: "Akun" })).toBeVisible();
  235 |   });
  236 | });
  237 | 
  238 | test.describe("Notes App", () => {
  239 |   test.beforeEach(async ({ page }) => {
  240 |     await mockPlatformAuth(page);
  241 |     await page.route("**/api/apps/notes/notes**", async (route) => {
  242 |       if (route.request().method() === "GET" && !route.request().url().includes("/tags")) {
  243 |         await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockNotes) });
  244 |       } else if (route.request().method() === "POST" || route.request().method() === "PATCH") {
  245 |         await route.continue();
  246 |       } else {
  247 |         await route.continue();
  248 |       }
  249 |     });
  250 |     await page.route("**/api/apps/notes/tags", async (route) => {
  251 |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tags: ["ide", "belanja"] }) });
  252 |     });
  253 |     await page.route("**/api/apps/notes/notes/*", async (route) => {
  254 |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ note: mockNotes.notes[0] }) });
  255 |     });
  256 |   });
  257 | 
  258 |   test("notes list renders with search", async ({ page }) => {
  259 |     await page.goto("/apps/notes");
  260 |     await expect(page.getByText("Catatan")).toBeVisible({ timeout: 10000 });
  261 |     await expect(page.getByPlaceholder("Cari catatan...")).toBeVisible();
  262 |   });
  263 | 
  264 |   test("notes new page renders", async ({ page }) => {
  265 |     await page.goto("/apps/notes/new");
  266 |     await expect(page.getByText("Catatan Baru")).toBeVisible({ timeout: 10000 });
  267 |     await expect(page.getByText("Judul *")).toBeVisible();
  268 |   });
  269 | 
  270 |   test("notes detail renders", async ({ page }) => {
  271 |     await page.goto("/apps/notes/n_1");
  272 |     // Detail page shows title or loading, then content
  273 |     await expect(page.getByText("Ide fitur").first()).toBeVisible({ timeout: 10000 });
  274 |   });
  275 | });
  276 | 
  277 | test.describe("Tasks App", () => {
  278 |   test.beforeEach(async ({ page }) => {
  279 |     await mockPlatformAuth(page);
  280 |     await page.route("**/api/apps/tasks/stats", async (route) => {
  281 |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTaskStats) });
  282 |     });
  283 |     await page.route("**/api/apps/tasks/tasks**", async (route) => {
  284 |       if (route.request().method() === "GET") {
  285 |         // Handle dueDate filtering mock: if dueDate param exists, filter
  286 |         const url = new URL(route.request().url());
  287 |         const dueDate = url.searchParams.get("dueDate");
  288 |         let tasks = mockTasks.tasks;
  289 |         if (dueDate) {
  290 |           tasks = tasks.filter((t: any) => t.dueDate === dueDate);
  291 |         }
  292 |         await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tasks }) });
  293 |       } else {
  294 |         await route.continue();
  295 |       }
  296 |     });
  297 |   });
  298 | 
  299 |   test("tasks dashboard renders stats", async ({ page }) => {
  300 |     await page.goto("/apps/tasks");
  301 |     await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
  302 |     await expect(page.getByText("Total")).toBeVisible();
  303 |     await expect(page.getByText("Terlambat")).toBeVisible();
  304 |   });
  305 | 
  306 |   test("tasks list has date filter (not text)", async ({ page }) => {
  307 |     await page.goto("/apps/tasks/list");
  308 |     await expect(page.getByText("Tugas").first()).toBeVisible({ timeout: 10000 });
  309 |     // Check for date input, not text search
  310 |     const dateInput = page.locator('input[type="date"]');
  311 |     await expect(dateInput).toBeVisible();
  312 |     // Ensure old text search placeholder is NOT present
  313 |     await expect(page.getByPlaceholder("Cari tugas...")).not.toBeVisible();
  314 |     await expect(page.getByText("Semua status")).toBeVisible();
  315 |   });
  316 | 
  317 |   test("tasks list date filter works", async ({ page }) => {
  318 |     await page.goto("/apps/tasks/list");
  319 |     const dateInput = page.locator('input[type="date"]');
  320 |     await dateInput.fill("2026-09-05");
  321 |     await expect(dateInput).toHaveValue("2026-09-05");
  322 |     // After filtering, should show 1 task (due 2026-09-05)
  323 |     // Mock will filter to 1
  324 |     await page.waitForTimeout(500);
```