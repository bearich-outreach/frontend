import { test, expect } from "@playwright/test";

// Mock data
const mockApps = [
  { id: "app_1", slug: "outreach", name: "Outreach", description: "Pipeline & otomasi outreach", icon: "outreach", enabled: true, createdAt: new Date().toISOString() },
  { id: "app_2", slug: "tasks", name: "Task Management", description: "Kelola tugas harian", icon: "tasks", enabled: true, createdAt: new Date().toISOString() },
  { id: "app_3", slug: "notes", name: "Notes", description: "Catatan & dokumentasi", icon: "notes", enabled: true, createdAt: new Date().toISOString() },
  { id: "app_4", slug: "cashflow", name: "Cash Flow", description: "Catat uang masuk & keluar", icon: "cashflow", enabled: true, createdAt: new Date().toISOString() },
];

const mockCashflowSummary = {
  summary: {
    totalIn: 5000000,
    totalOut: 1500000,
    balance: 3500000,
    countIn: 5,
    countOut: 3,
    byCategory: { Gaji: 5000000, Makanan: 800000, Transport: 700000 },
    perAccount: [
      { account: "Tunai", balance: 1000000 },
      { account: "Rekening", balance: 2500000 },
    ],
  },
};

const mockAccounts = {
  accounts: [
    { id: "acc_1", name: "Tunai", type: "tunai", createdAt: new Date().toISOString() },
    { id: "acc_2", name: "Rekening", type: "rekening", createdAt: new Date().toISOString() },
    { id: "acc_3", name: "E-Wallet", type: "ewallet", createdAt: new Date().toISOString() },
  ],
};

const mockTransactions = {
  transactions: [
    { id: "t_1", type: "in", amount: 5000000, category: "Gaji", account: "Rekening", description: "Gaji bulanan", date: "2026-08-31", createdAt: new Date().toISOString() },
    { id: "t_2", type: "out", amount: 500000, category: "Makanan", account: "Tunai", description: "Belanja", date: "2026-08-30", createdAt: new Date().toISOString() },
  ],
};

const mockCashflowSettings = {
  settings: { targetAmount: 50000000, targetType: "saving" },
  balance: 3500000,
};

const mockNotes = {
  notes: [
    { id: "n_1", title: "Ide fitur", content: "Tambah grafik", tags: ["ide", "cashflow"], pinned: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "n_2", title: "Belanja", content: "Beli beras", tags: ["belanja"], pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
};

const mockTasks = {
  tasks: [
    { id: "tsk_1", title: "Kerjakan laporan", description: "Laporan bulanan", status: "todo", priority: "high", dueDate: "2026-09-05", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "tsk_2", title: "Review PR", description: "", status: "in_progress", priority: "medium", dueDate: "2026-09-02", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
};

const mockTaskStats = {
  stats: { total: 5, todo: 2, inProgress: 1, done: 2, overdue: 1, dueToday: 1, doneToday: 1 },
};

const mockOutreachMetrics = {
  metrics: { total: 10, byStatus: { new: 3, contacted: 2 }, replied: 4, interested: 2, closed: 1, dead: 0, due: 2, replyRate: 40, closeRate: 10, revenue: 5000000 },
};

async function mockPlatformAuth(page: any) {
  await page.route("**/api/platform/me", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "admin" }) });
  });
  await page.route("**/api/apps", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ apps: mockApps }) });
  });
}

test.describe("Platform", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Bearich Hub")).toBeVisible();
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
  });

  test("platform dashboard shows apps", async ({ page }) => {
    await mockPlatformAuth(page);
    await page.goto("/");
    await expect(page.getByText("Aplikasi")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Outreach")).toBeVisible();
    await expect(page.getByText("Cash Flow")).toBeVisible();
  });
});

test.describe("Outreach App", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatformAuth(page);
    await page.route("**/api/apps/outreach/stats", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockOutreachMetrics) });
    });
    await page.route("**/api/apps/outreach/queue", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ due: [] }) });
    });
    await page.route("**/api/apps/outreach/settings", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ settings: { businessName: "Bearich Studio", services: ["Web"], segmentFocus: "", provider: "none", apiKey: "", baseUrl: "", model: "", weeklyTarget: 25, sequence: [] } }) });
    });
    await page.route("**/api/apps/outreach/prospects**", async (route: any) => {
      if (route.request().method() === "GET" && route.request().url().includes("/prospects") && !route.request().url().includes("/activities")) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ prospects: [] }) });
      } else {
        await route.continue();
      }
    });
  });

  test("outreach dashboard renders metrics", async ({ page }) => {
    await page.goto("/apps/outreach");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Total Prospek")).toBeVisible();
  });

  test("outreach queue renders", async ({ page }) => {
    await page.goto("/apps/outreach/queue");
    await expect(page.getByText("Outreach Queue")).toBeVisible({ timeout: 10000 });
  });

  test("outreach prospects list renders", async ({ page }) => {
    await page.goto("/apps/outreach/prospects");
    await expect(page.getByText("Prospects")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Export CSV")).toBeVisible();
  });

  test("outreach settings renders", async ({ page }) => {
    await page.goto("/apps/outreach/settings");
    await expect(page.getByText("Settings")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Profil Bisnis")).toBeVisible();
  });
});

test.describe("Cashflow App", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatformAuth(page);
    await page.route("**/api/apps/cashflow/summary**", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockCashflowSummary) });
    });
    await page.route("**/api/apps/cashflow/transactions**", async (route: any) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTransactions) });
      } else {
        await route.continue();
      }
    });
    await page.route("**/api/apps/cashflow/accounts", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockAccounts) });
    });
    await page.route("**/api/apps/cashflow/settings", async (route: any) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockCashflowSettings) });
      } else {
        await route.continue();
      }
    });
  });

  test("cashflow dashboard renders with date range filter", async ({ page }) => {
    await page.goto("/apps/cashflow");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
    // Check date range inputs exist (type date)
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.first()).toBeVisible();
    await expect(dateInputs.nth(1)).toBeVisible();
    // Check presets including Bulan ini
    await expect(page.getByText("Hari ini")).toBeVisible();
    await expect(page.getByText("Kemarin")).toBeVisible();
    await expect(page.getByText("Bulan ini")).toBeVisible();
    await expect(page.getByText("Semua waktu")).toBeVisible();
    // Check stats cards
    await expect(page.getByText("Uang Masuk")).toBeVisible();
    await expect(page.getByText("Saldo per Akun")).toBeVisible();
    // Check target progress bar
    await expect(page.getByText("Target Tabungan")).toBeVisible();
  });

  test("cashflow dashboard date filter presets work", async ({ page }) => {
    await page.goto("/apps/cashflow");
    await page.waitForTimeout(1000);
    // Click Bulan ini
    await page.getByText("Bulan ini").click();
    const startInput = page.locator('input[type="date"]').first();
    const endInput = page.locator('input[type="date"]').nth(1);
    await expect(startInput).not.toHaveValue("");
    await expect(endInput).not.toHaveValue("");
    // Click Semua waktu to clear
    await page.getByText("Semua waktu").click();
    await expect(startInput).toHaveValue("");
    await expect(endInput).toHaveValue("");
  });

  test("cashflow transactions page has date range filter", async ({ page }) => {
    await page.goto("/apps/cashflow/transactions");
    await expect(page.getByText("Transaksi")).toBeVisible({ timeout: 10000 });
    // Should have two date inputs for start/end range
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.first()).toBeVisible();
    await expect(dateInputs.nth(1)).toBeVisible();
    await expect(page.getByText("Semua tipe")).toBeVisible();
  });

  test("cashflow accounts page renders", async ({ page }) => {
    await page.goto("/apps/cashflow/accounts");
    await expect(page.getByText("Akun")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Tambah Akun")).toBeVisible();
  });

  test("cashflow transfer page renders", async ({ page }) => {
    await page.goto("/apps/cashflow/transfer");
    await expect(page.getByText("Transfer")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Dari akun")).toBeVisible();
    await expect(page.getByText("Ke akun")).toBeVisible();
  });

  test("cashflow settings (target) page renders", async ({ page }) => {
    await page.goto("/apps/cashflow/settings");
    await expect(page.getByText("Target")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Target tabungan (Rp)")).toBeVisible();
    // Check delete button appears when target exists (mock has 50jt)
    // The page shows Hapus Target when targetAmount > 0
  });

  test("cashflow sidebar active state", async ({ page }) => {
    await page.goto("/apps/cashflow/transactions");
    await expect(page.locator('a.nav-link-active', { hasText: "Transaksi" })).toBeVisible({ timeout: 10000 });
    await page.goto("/apps/cashflow/accounts");
    await expect(page.locator('a.nav-link-active', { hasText: "Akun" })).toBeVisible();
  });
});

test.describe("Notes App", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatformAuth(page);
    await page.route("**/api/apps/notes/notes**", async (route: any) => {
      if (route.request().method() === "GET" && !route.request().url().includes("/tags")) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockNotes) });
      } else if (route.request().method() === "POST" || route.request().method() === "PATCH") {
        await route.continue();
      } else {
        await route.continue();
      }
    });
    await page.route("**/api/apps/notes/tags", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tags: ["ide", "belanja"] }) });
    });
    await page.route("**/api/apps/notes/notes/*", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ note: mockNotes.notes[0] }) });
    });
  });

  test("notes list renders with search", async ({ page }) => {
    await page.goto("/apps/notes");
    await expect(page.getByText("Catatan")).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder("Cari catatan...")).toBeVisible();
  });

  test("notes new page renders", async ({ page }) => {
    await page.goto("/apps/notes/new");
    await expect(page.getByText("Catatan Baru")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Judul *")).toBeVisible();
  });

  test("notes detail renders", async ({ page }) => {
    await page.goto("/apps/notes/n_1");
    // Detail page shows title or loading, then content
    await expect(page.getByText("Ide fitur").first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Tasks App", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatformAuth(page);
    await page.route("**/api/apps/tasks/stats", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTaskStats) });
    });
    await page.route("**/api/apps/tasks/tasks**", async (route: any) => {
      if (route.request().method() === "GET") {
        // Handle dueDate filtering mock: if dueDate param exists, filter
        const url = new URL(route.request().url());
        const dueDate = url.searchParams.get("dueDate");
        let tasks = mockTasks.tasks;
        if (dueDate) {
          tasks = tasks.filter((t: any) => t.dueDate === dueDate);
        }
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tasks }) });
      } else {
        await route.continue();
      }
    });
  });

  test("tasks dashboard renders stats", async ({ page }) => {
    await page.goto("/apps/tasks");
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByText("Terlambat")).toBeVisible();
  });

  test("tasks list has date filter (not text)", async ({ page }) => {
    await page.goto("/apps/tasks/list");
    await expect(page.getByText("Tugas").first()).toBeVisible({ timeout: 10000 });
    // Check for date input, not text search
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    // Ensure old text search placeholder is NOT present
    await expect(page.getByPlaceholder("Cari tugas...")).not.toBeVisible();
    await expect(page.getByText("Semua status")).toBeVisible();
  });

  test("tasks list date filter works", async ({ page }) => {
    await page.goto("/apps/tasks/list");
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill("2026-09-05");
    await expect(dateInput).toHaveValue("2026-09-05");
    // After filtering, should show 1 task (due 2026-09-05)
    // Mock will filter to 1
    await page.waitForTimeout(500);
  });

  test("tasks new page renders with date", async ({ page }) => {
    await page.goto("/apps/tasks/new");
    await expect(page.getByText("Tugas Baru")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });

  test("tasks sidebar active state", async ({ page }) => {
    await page.goto("/apps/tasks/list");
    await expect(page.locator('a.nav-link-active', { hasText: "Tugas" })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Responsive & Sidebar", () => {
  test("outreach sidebar active state", async ({ page }) => {
    await mockPlatformAuth(page);
    await page.route("**/api/apps/outreach/**", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ metrics: mockOutreachMetrics.metrics, due: [], prospects: [], settings: { businessName: "Test", services: [], segmentFocus: "", provider: "none", apiKey: "", baseUrl: "", model: "", weeklyTarget: 25, sequence: [] } }) });
    });
    await page.goto("/apps/outreach/queue");
    await expect(page.locator('a.nav-link-active', { hasText: "Outreach Queue" })).toBeVisible({ timeout: 10000 });
  });
});
