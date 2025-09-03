import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dashboardButtonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                // Navigation button for sidebar
                navigation:
                    "w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-600/20 data-[active=true]:bg-gray-600/20 data-[active=true]:text-white",
                // Primary action button with gradient
                primary:
                    "bg-purple-600 text-white hover:opacity-90",
                // Help/support button
                help:
                    "w-full bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white",
                // Logout button variant
                logout:
                    "w-full bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white",
                // Record button variant
                record:
                    "bg-purple-600 text-white hover:opacity-90",
                // Icon button for header actions
                icon:
                    "p-2 text-gray-400 hover:text-white rounded-md",
                // Mobile menu button
                mobile:
                    "lg:hidden p-2 text-gray-400 hover:text-white",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 px-3 py-1.5 text-xs",
                lg: "h-10 px-6 py-2",
                icon: "h-9 w-9",
                navigation: "h-auto",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
)

export interface DashboardButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof dashboardButtonVariants> {
    asChild?: boolean
    active?: boolean
}

const DashboardButton = React.forwardRef<HTMLButtonElement, DashboardButtonProps>(
    ({ className, variant, size, asChild = false, active, ...props }, ref) => {
        return (
            <button
                className={cn(dashboardButtonVariants({ variant, size, className }))}
                ref={ref}
                data-active={active}
                {...props}
            />
        )
    }
)

DashboardButton.displayName = "DashboardButton"

export { DashboardButton, dashboardButtonVariants }
