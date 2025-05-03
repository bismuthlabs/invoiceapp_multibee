"use client"
	
import React, { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", {
      error: error.message,
      stack: error.stack,
      errorInfo,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Something Went Wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                An unexpected error occurred while loading the invoice application. Please try again.
              </p>
              <Button onClick={this.handleRetry} variant="outline">
                Retry
              </Button>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="mt-4 text-sm text-gray-600 overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}