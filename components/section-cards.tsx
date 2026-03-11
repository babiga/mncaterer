"use client"

import { useEffect, useMemo, useState } from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type DashboardAnalytics = {
  newCustomers: number
  activeAccounts: number
  visitors: number
  visitorDelta: number
  visitorsWeek: number
  visitorsWeekDelta: number
  deltas: {
    newCustomers: number
    activeAccounts: number
    visitors: number
  }
}

const initialAnalytics: DashboardAnalytics = {
  newCustomers: 0,
  activeAccounts: 0,
  visitors: 0,
  visitorDelta: 0,
  visitorsWeek: 0,
  visitorsWeekDelta: 0,
  deltas: {
    newCustomers: 0,
    activeAccounts: 0,
    visitors: 0,
  },
}

function formatDelta(value: number) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

function DeltaBadge({ value }: { value: number }) {
  const isPositive = value >= 0
  const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon

  return (
    <Icon className="size-4" />
  )
}

export function SectionCards() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>(initialAnalytics)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/dashboard/analytics", { cache: "no-store" })
        if (!response.ok) return

        const payload = await response.json()
        if (!payload?.success || !payload?.data) return
        setAnalytics(payload.data as DashboardAnalytics)
      } catch {
        // Preserve zero-state if analytics fetch fails.
      }
    }

    loadAnalytics()
  }, [])

  const formattedCustomers = useMemo(
    () => new Intl.NumberFormat("en-US").format(analytics.newCustomers),
    [analytics.newCustomers],
  )

  const formattedAccounts = useMemo(
    () => new Intl.NumberFormat("en-US").format(analytics.activeAccounts),
    [analytics.activeAccounts],
  )

  const formattedVisitors = useMemo(
    () => new Intl.NumberFormat("en-US").format(analytics.visitors),
    [analytics.visitors],
  )

  const formattedVisitorsWeek = useMemo(
    () => new Intl.NumberFormat("en-US").format(analytics.visitorsWeek),
    [analytics.visitorsWeek],
  )

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Visitors</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formattedVisitors}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DeltaBadge value={analytics.visitorDelta} />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Overall site traffic
          </div>
          <div className="text-muted-foreground">
            Mobile and desktop combined
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formattedCustomers}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DeltaBadge value={analytics.deltas.newCustomers} />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Current month signups
          </div>
          <div className="text-muted-foreground">
            Compared to previous month
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formattedAccounts}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DeltaBadge value={analytics.deltas.activeAccounts} />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Customer + active dashboard users
          </div>
          <div className="text-muted-foreground">Monthly account creation trend</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Visitors of Week</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formattedVisitorsWeek}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DeltaBadge value={analytics.visitorsWeekDelta} />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Last 7 days traffic
          </div>
          <div className="text-muted-foreground">Compared to previous week</div>
        </CardFooter>
      </Card>
    </div>
  )
}
