# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Platform >> login page renders
- Location: tests/e2e.spec.ts:78:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Bearich Hub')
Expected: visible
Error: strict mode violation: getByText('Bearich Hub') resolved to 2 elements:
    1) <h1 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Bearich Hub</h1> aka getByRole('heading', { name: 'Bearich Hub' })
    2) <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Masuk ke Bearich Hub untuk membuka aplikasi Anda.</p> aka getByText('Masuk ke Bearich Hub untuk')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Bearich Hub')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Bearich Hub" [level=1] [ref=e8]
      - paragraph [ref=e9]: Masuk ke Bearich Hub untuk membuka aplikasi Anda.
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Username
        - textbox "Username" [ref=e13]:
          - /placeholder: admin
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - textbox "Password" [ref=e16]:
          - /placeholder: ••••••••
      - button "Masuk" [ref=e17] [cursor=pointer]
  - alert [ref=e18]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | // Mock data
  4   | const mockApps = [
  5   |   { id: "app_1", slug: "outreach", name: "Outreach", description: "Pipeline & otomasi outreach", icon: "outreach", enabled: true, createdAt: new Date().toISOString() },
  6   |   { id: "app_2", slug: "tasks", name: "Task Management", description: "Kelola tugas harian", icon: "tasks", enabled: true, createdAt: new Date().toISOString() },
  7   |   { id: "app_3", slug: "notes", name: "Notes", description: "Catatan & dokumentasi", icon: "notes", enabled: true, createdAt: new Date().toISOString() },
  8   |   { id: "app_4", slug: "cashflow", name: "Cash Flow", description: "Catat uang masuk & keluar", icon: "cashflow", enabled: true, createdAt: new Date().toISOString() },
  9   | ];
  10  | 
  11  | const mockCashflowSummary = {
  12  |   summary: {
  13  |     totalIn: 5000000,
  14  |     totalOut: 1500000,
  15  |     balance: 3500000,
  16  |     countIn: 5,
  17  |     countOut: 3,
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
> 80  |     await expect(page.getByText("Bearich Hub")).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
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
  118 |     await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
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
```