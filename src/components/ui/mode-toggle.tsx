"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const root = window.document.documentElement
    const isDark = root.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  const toggleTheme = (newTheme: "light" | "dark") => {
    const root = window.document.documentElement
    const isDark = newTheme === "dark"

    root.classList.toggle("dark", isDark)
    setTheme(newTheme)
    
    try {
      window.localStorage.setItem("theme", newTheme)
    } catch (error) {
      console.error("Failed to save theme preference", error)
    }
  }

  React.useEffect(() => {
    const root = window.document.documentElement
    
    const handleThemeChange = () => {
      try {
        const savedTheme = window.localStorage.getItem("theme") as "light" | "dark" | null
        
        if (savedTheme) {
          root.classList.toggle("dark", savedTheme === "dark")
          setTheme(savedTheme)
        } else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          root.classList.toggle("dark", prefersDark)
          setTheme(prefersDark ? "dark" : "light")
        }
      } catch (error) {
        console.error("Failed to load theme preference", error)
      }
    }
    
    handleThemeChange()
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", handleThemeChange)
    
    return () => mediaQuery.removeEventListener("change", handleThemeChange)
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toggleTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleTheme("dark")}>
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 