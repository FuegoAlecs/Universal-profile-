"use client"

import * as React from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@tanstack/react-charts"
import { ChartConfig, ChartContext } from "@tanstack/react-charts/dist/lib/react/ChartContext"
import { cn } from "@/lib/utils"
import { SelectContent, SelectItem } from "@/components/ui/select"

// Learn more about @tanstack/react-charts:
// https://tanstack.com/charts/latest/docs/react/overview

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { className, children } = props
  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4 h-9", className)} {...props}>
      {children}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<HTMLDivElement, { config: ChartConfig }>((props, ref) => {
  const { config, className } = props
  const { activeConfig } = React.useContext(ChartContext)
  const defaultValues = Object.entries(config).filter(([, { legend }]) => legend)
  const activeValues = Object.entries(config).filter(([key]) => key === activeConfig?.id)
  const values = activeValues.length ? activeValues : defaultValues

  return (
    <ChartLegend ref={ref} className={cn("flex flex-wrap justify-center gap-x-4 gap-y-2", className)} {...props}>
      {values.map(([key, item]) => (
        <div key={key} className="flex items-center gap-1.5">
          {item.icon &&
            React.createElement(item.icon, {
              className: cn("h-3 w-3 shrink-0", item.color),
            })}
          {item.label ? item.label : key}
        </div>
      ))}
    </ChartLegend>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartSelect = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { className, children } = props
  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-2", className)} {...props}>
      {children}
    </div>
  )
})
ChartSelect.displayName = "ChartSelect"
\
const ChartSelectContent = React.forwardRef < HTMLDivElement,
  React
.ComponentPropsWithoutRef<typeof SelectContent> &
{
  config: ChartConfig
}
}((props, ref) =>
{
  const { config, className, children } = props
  const { activeConfig } = React.useContext(ChartContext)
  const defaultValues = Object.entries(config).filter(([, { select }]) => select)
  const activeValues = Object.entries(config).filter(([key]) => key === activeConfig?.id)
  const values = activeValues.length ? activeValues : defaultValues

  return (
    <SelectContent ref={ref} className={cn("flex flex-col gap-px", className)} {...props}>
      {values.map(([key, item]) => (
        <SelectItem key={key} value={key} className="w-full">
          {item.label}
        </SelectItem>
      ))}
    </SelectContent>
  );
  \
}
)
ChartSelectContent.displayName = "ChartSelectContent"
\
const Chart = React.forwardRef < HTMLDivElement,
  React
.ComponentProps<typeof ChartContainer> &
{
  config: ChartConfig
}
}((props, ref) =>
{
  const { config, className, children } = props
  return (
    <ChartContext.Provider value={config}>
      <ChartContainer
        ref={ref}
        className={cn("flex h-[400px] w-full", className)}
        {...props}
      >
        {children}
      </ChartContainer>
    </ChartContext.Provider>
  );
  \
}
)
Chart.displayName = "Chart"

export { Chart, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartSelect, ChartSelectContent }
