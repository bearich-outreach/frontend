# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Outreach App >> outreach dashboard renders metrics
- Location: tests/e2e.spec.ts:116:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Dashboard')
Expected: visible
Error: strict mode violation: getByText('Dashboard') resolved to 2 elements:
    1) <a href="/apps/outreach" class="nav-link-active">…</a> aka getByRole('link', { name: 'Dashboard' })
    2) <a href="/apps/outreach" class="nav-link-active shrink-0">Dashboard</a> aka locator('header').getByText('Dashboard')

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Dashboard')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]
  - alert [ref=e11]
  - generic [ref=e12]:
    - complementary [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: B
        - generic [ref=e16]: Bearich Outreach
      - navigation [ref=e17]:
        - link "Dashboard" [ref=e18] [cursor=pointer]:
          - /url: /apps/outreach
        - link "Outreach Queue" [ref=e21] [cursor=pointer]:
          - /url: /apps/outreach/queue
        - link "Prospects" [ref=e24] [cursor=pointer]:
          - /url: /apps/outreach/prospects
        - link "+ Tambah Prospek" [ref=e27] [cursor=pointer]:
          - /url: /apps/outreach/prospects/new
        - link "Settings" [ref=e30] [cursor=pointer]:
          - /url: /apps/outreach/settings
      - generic [ref=e33]:
        - button "Toggle tema" [ref=e34] [cursor=pointer]: Mode gelap
        - link "Kembali ke platform" [ref=e37] [cursor=pointer]:
          - /url: /
    - main [ref=e41]:
      - generic [ref=e42]:
        - generic [ref=e43]:
          - heading "Dashboard" [level=1] [ref=e44]
          - paragraph [ref=e45]: Pipeline & metrik konsistensi outreach Anda.
        - generic [ref=e46]:
          - generic [ref=e47]:
            - generic [ref=e48]: Total Prospek
            - generic [ref=e49]: "10"
          - generic [ref=e50]:
            - generic [ref=e51]: Butuh Outreach
            - generic [ref=e52]: "2"
            - generic [ref=e53]: tindakan hari ini
          - generic [ref=e54]:
            - generic [ref=e55]: Reply Rate
            - generic [ref=e56]: 40%
            - generic [ref=e57]: replied / total
          - generic [ref=e58]:
            - generic [ref=e59]: Revenue
            - generic [ref=e60]: Rp 5.000.000
            - generic [ref=e61]: 1 deal
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]: New
            - generic [ref=e65]: "3"
          - generic [ref=e66]:
            - generic [ref=e67]: Contacted
            - generic [ref=e68]: "2"
          - generic [ref=e69]:
            - generic [ref=e70]: Replied
            - generic [ref=e71]: "0"
          - generic [ref=e72]:
            - generic [ref=e73]: Interested
            - generic [ref=e74]: "0"
          - generic [ref=e75]:
            - generic [ref=e76]: Closed
            - generic [ref=e77]: "0"
          - generic [ref=e78]:
            - generic [ref=e79]: Dead
            - generic [ref=e80]: "0"
        - generic [ref=e81]:
          - heading "Antrian Tindakan Hari Ini" [level=2] [ref=e82]
          - paragraph [ref=e83]: Tidak ada yang perlu di-outreach. Tambah prospek baru atau isi pipeline.
          - link "Buka Outreach Queue" [ref=e84] [cursor=pointer]:
            - /url: /apps/outreach/queue
```

# Test source

```ts
  18  |     byCategory: { Gaji: 5000000, Makanan: 800000, Transport: 700000 },
  19  |     perAccount: [
  20  |       { account: "Tunai", balance: 1000000 },
  21  |       { account: "Rekening", balance: 2500000 },
  22  |     ],
  23  |   },
  24  | };
  25  | 
  26  | const mockAccounts = {
  27  |   accounts: [
  28  |     { id: "acc_1", name: "Tunai", type: "tunai", createdAt: new Date().toISOString() },
  29  |     { id: "acc_2", name: "Rekening", type: "rekening", createdAt: new Date().toISOString() },
  30  |     { id: "acc_3", name: "E-Wallet", type: "ewallet", createdAt: new Date().toISOString() },
  31  |   ],
  32  | };
  33  | 
  34  | const mockTransactions = {
  35  |   transactions: [
  36  |     { id: "t_1", type: "in", amount: 5000000, category: "Gaji", account: "Rekening", description: "Gaji bulanan", date: "2026-08-31", createdAt: new Date().toISOString() },
  37  |     { id: "t_2", type: "out", amount: 500000, category: "Makanan", account: "Tunai", description: "Belanja", date: "2026-08-30", createdAt: new Date().toISOString() },
  38  |   ],
  39  | };
  40  | 
  41  | const mockCashflowSettings = {
  42  |   settings: { targetAmount: 50000000, targetType: "saving" },
  43  |   balance: 3500000,
  44  | };
  45  | 
  46  | const mockNotes = {
  47  |   notes: [
  48  |     { id: "n_1", title: "Ide fitur", content: "Tambah grafik", tags: ["ide", "cashflow"], pinned: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  49  |     { id: "n_2", title: "Belanja", content: "Beli beras", tags: ["belanja"], pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  50  |   ],
  51  | };
  52  | 
  53  | const mockTasks = {
  54  |   tasks: [
  55  |     { id: "tsk_1", title: "Kerjakan laporan", description: "Laporan bulanan", status: "todo", priority: "high", dueDate: "2026-09-05", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  56  |     { id: "tsk_2", title: "Review PR", description: "", status: "in_progress", priority: "medium", dueDate: "2026-09-02", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  57  |   ],
  58  | };
  59  | 
  60  | const mockTaskStats = {
  61  |   stats: { total: 5, todo: 2, inProgress: 1, done: 2, overdue: 1, dueToday: 1, doneToday: 1 },
  62  | };
  63  | 
  64  | const mockOutreachMetrics = {
  65  |   metrics: { total: 10, byStatus: { new: 3, contacted: 2 }, replied: 4, interested: 2, closed: 1, dead: 0, due: 2, replyRate: 40, closeRate: 10, revenue: 5000000 },
  66  | };
  67  | 
  68  | async function mockPlatformAuth(page) {
  69  |   await page.route("**/api/platform/me", async (route) => {
  70  |     await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "admin" }) });
  71  |   });
  72  |   await page.route("**/api/apps", async (route) => {
  73  |     await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ apps: mockApps }) });
  74  |   });
  75  | }
  76  | 
  77  | test.describe("Platform", () => {
  78  |   test("login page renders", async ({ page }) => {
  79  |     await page.goto("/login");
  80  |     await expect(page.getByText("Bearich Hub")).toBeVisible();
  81  |     await expect(page.locator('input#username')).toBeVisible();
  82  |     await expect(page.locator('input#password')).toBeVisible();
  83  |     await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
  84  |   });
  85  | 
  86  |   test("platform dashboard shows apps", async ({ page }) => {
  87  |     await mockPlatformAuth(page);
  88  |     await page.goto("/");
  89  |     await expect(page.getByText("Aplikasi")).toBeVisible({ timeout: 10000 });
  90  |     await expect(page.getByText("Outreach")).toBeVisible();
  91  |     await expect(page.getByText("Cash Flow")).toBeVisible();
  92  |   });
  93  | });
  94  | 
  95  | test.describe("Outreach App", () => {
  96  |   test.beforeEach(async ({ page }) => {
  97  |     await mockPlatformAuth(page);
  98  |     await page.route("**/api/apps/outreach/stats", async (route) => {
  99  |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockOutreachMetrics) });
  100 |     });
  101 |     await page.route("**/api/apps/outreach/queue", async (route) => {
  102 |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ due: [] }) });
  103 |     });
  104 |     await page.route("**/api/apps/outreach/settings", async (route) => {
  105 |       await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ settings: { businessName: "Bearich Studio", services: ["Web"], segmentFocus: "", provider: "none", apiKey: "", baseUrl: "", model: "", weeklyTarget: 25, sequence: [] } }) });
  106 |     });
  107 |     await page.route("**/api/apps/outreach/prospects**", async (route) => {
  108 |       if (route.request().method() === "GET" && route.request().url().includes("/prospects") && !route.request().url().includes("/activities")) {
  109 |         await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ prospects: [] }) });
  110 |       } else {
  111 |         await route.continue();
  112 |       }
  113 |     });
  114 |   });
  115 | 
  116 |   test("outreach dashboard renders metrics", async ({ page }) => {
  117 |     await page.goto("/apps/outreach");
> 118 |     await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
      |                                               ^ Error: expect(locator).toBeVisible() failed
  119 |     await expect(page.getByText("Total Prospek")).toBeVisible();
  120 |   });
  121 | 
  122 |   test("outreach queue renders", async ({ page }) => {
  123 |     await page.goto("/apps/outreach/queue");
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
```