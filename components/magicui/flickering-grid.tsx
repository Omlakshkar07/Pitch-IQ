"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface FlickeringGridProps {
    squareSize?: number
    gridGap?: number
    flickerChance?: number
    color?: string
    width?: number
    height?: number
    className?: string
    maxOpacity?: number
}

export const FlickeringGrid = ({
    squareSize = 4,
    gridGap = 6,
    flickerChance = 0.3,
    color = "#E85D04",
    width,
    height,
    className,
    maxOpacity = 0.3,
}: FlickeringGridProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isInView, setIsInView] = useState(false)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    const setupCanvas = useCallback(
        (canvas: HTMLCanvasElement, width: number, height: number) => {
            const dpr = window.devicePixelRatio || 1
            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = (`${width}px`)
            canvas.style.height = (`${height}px`)
            const cols = Math.floor(width / (squareSize + gridGap))
            const rows = Math.floor(height / (squareSize + gridGap))

            const squares = new Float32Array(cols * rows)
            for (let i = 0; i < squares.length; i++) {
                squares[i] = Math.random() * maxOpacity
            }

            return { cols, rows, squares, dpr }
        },
        [squareSize, gridGap, maxOpacity],
    )

    const updateSquares = useCallback(
        (squares: Float32Array, cols: number, rows: number) => {
            for (let i = 0; i < squares.length; i++) {
                if (Math.random() < flickerChance) {
                    squares[i] = Math.random() * maxOpacity
                }
            }
        },
        [flickerChance, maxOpacity],
    )

    const drawGrid = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            width: number,
            height: number,
            cols: number,
            rows: number,
            squares: Float32Array,
            dpr: number,
        ) => {
            ctx.clearRect(0, 0, width, height)
            ctx.fillStyle = "transparent"
            ctx.fillRect(0, 0, width, height)

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const opacity = squares[i * rows + j]
                    ctx.globalAlpha = opacity
                    ctx.fillStyle = color
                    ctx.fillRect(
                        i * (squareSize + gridGap) * dpr,
                        j * (squareSize + gridGap) * dpr,
                        squareSize * dpr,
                        squareSize * dpr,
                    )
                }
            }
        },
        [color, squareSize, gridGap],
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            setCanvasSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            })
        })

        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { width, height } = canvasSize
        if (width === 0 || height === 0) return

        const { cols, rows, squares, dpr } = setupCanvas(canvas, width, height)

        let animationFrameId: number

        const render = () => {
            updateSquares(squares, cols, rows)
            drawGrid(ctx, width * dpr, height * dpr, cols, rows, squares, dpr)
            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => cancelAnimationFrame(animationFrameId)
    }, [canvasSize, setupCanvas, updateSquares, drawGrid])

    return (
        <div ref={containerRef} className={`w-full h-full ${className} pointer-events-none`}>
            <canvas
                ref={canvasRef}
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                }}
            />
        </div>
    )
}
