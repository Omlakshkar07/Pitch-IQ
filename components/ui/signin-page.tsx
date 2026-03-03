"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";

type Uniforms = {
    [key: string]: {
        value: number[] | number[][] | number;
        type: string;
    };
};

interface ShaderProps {
    source: string;
    uniforms: {
        [key: string]: {
            value: number[] | number[][] | number;
            type: string;
        };
    };
    maxFps?: number;
}

interface SignInPageProps {
    className?: string;
    isSignUp?: boolean;
}

export const CanvasRevealEffect = ({
    animationSpeed = 10,
    opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
    colors = [[156, 255, 30]],
    containerClassName,
    dotSize,
    showGradient = true,
    reverse = false,
}: {
    animationSpeed?: number;
    opacities?: number[];
    colors?: number[][];
    containerClassName?: string;
    dotSize?: number;
    showGradient?: boolean;
    reverse?: boolean;
}) => {
    return (
        <div className={cn("h-full relative w-full", containerClassName)}>
            <div className="h-full w-full">
                <DotMatrix
                    colors={colors ?? [[156, 255, 30]]}
                    dotSize={dotSize ?? 3}
                    opacities={
                        opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
                    }
                    shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
                    center={["x", "y"]}
                />
            </div>
            {showGradient && (
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            )}
        </div>
    );
};

interface DotMatrixProps {
    colors?: number[][];
    opacities?: number[];
    totalSize?: number;
    dotSize?: number;
    shader?: string;
    center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
    colors = [[0, 0, 0]],
    opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
    totalSize = 20,
    dotSize = 2,
    shader = "",
    center = ["x", "y"],
}) => {
    const uniforms = React.useMemo(() => {
        let colorsArray = [
            colors[0],
            colors[0],
            colors[0],
            colors[0],
            colors[0],
            colors[0],
        ];
        if (colors.length === 2) {
            colorsArray = [
                colors[0],
                colors[0],
                colors[0],
                colors[1],
                colors[1],
                colors[1],
            ];
        } else if (colors.length === 3) {
            colorsArray = [
                colors[0],
                colors[0],
                colors[1],
                colors[1],
                colors[2],
                colors[2],
            ];
        }
        return {
            u_colors: {
                value: colorsArray.map((color) => [
                    color[0] / 255,
                    color[1] / 255,
                    color[2] / 255,
                ]),
                type: "uniform3fv",
            },
            u_opacities: {
                value: opacities,
                type: "uniform1fv",
            },
            u_total_size: {
                value: totalSize,
                type: "uniform1f",
            },
            u_dot_size: {
                value: dotSize,
                type: "uniform1f",
            },
            u_reverse: {
                value: shader.includes("u_reverse_active") ? 1 : 0,
                type: "uniform1i",
            },
        };
    }, [colors, opacities, totalSize, dotSize, shader]);

    return (
        <Shader
            source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse; 

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x")
                    ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));"
                    : ""
                }
            ${center.includes("y")
                    ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));"
                    : ""
                }

            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2); 
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 0.5; 
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);


            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                 opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                 opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a; 
        }`}
            uniforms={uniforms}
            maxFps={60}
        />
    );
};

const ShaderMaterial = ({
    source,
    uniforms,
    maxFps = 60,
}: {
    source: string;
    hovered?: boolean;
    maxFps?: number;
    uniforms: Uniforms;
}) => {
    const { size } = useThree();
    const ref = useRef<THREE.Mesh>(null);
    let lastFrameTime = 0;

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const timestamp = clock.getElapsedTime();

        lastFrameTime = timestamp;

        const material: any = ref.current.material;
        const timeLocation = material.uniforms.u_time;
        timeLocation.value = timestamp;
    });

    const getUniforms = () => {
        const preparedUniforms: any = {};

        for (const uniformName in uniforms) {
            const uniform: any = uniforms[uniformName];

            switch (uniform.type) {
                case "uniform1f":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
                    break;
                case "uniform1i":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1i" };
                    break;
                case "uniform3f":
                    preparedUniforms[uniformName] = {
                        value: new THREE.Vector3().fromArray(uniform.value),
                        type: "3f",
                    };
                    break;
                case "uniform1fv":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
                    break;
                case "uniform3fv":
                    preparedUniforms[uniformName] = {
                        value: uniform.value.map((v: number[]) =>
                            new THREE.Vector3().fromArray(v)
                        ),
                        type: "3fv",
                    };
                    break;
                case "uniform2f":
                    preparedUniforms[uniformName] = {
                        value: new THREE.Vector2().fromArray(uniform.value),
                        type: "2f",
                    };
                    break;
                default:
                    console.error(`Invalid uniform type for '${uniformName}'.`);
                    break;
            }
        }

        preparedUniforms["u_time"] = { value: 0, type: "1f" };
        preparedUniforms["u_resolution"] = {
            value: new THREE.Vector2(size.width * 2, size.height * 2),
        };
        return preparedUniforms;
    };

    const material = useMemo(() => {
        const materialObject = new THREE.ShaderMaterial({
            vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        float x = position.x;
        float y = position.y;
        gl_Position = vec4(x, y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
      `,
            fragmentShader: source,
            uniforms: getUniforms(),
            glslVersion: THREE.GLSL3,
            blending: THREE.CustomBlending,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneFactor,
        });

        return materialObject;
    }, [size.width, size.height, source]);

    return (
        <mesh ref={ref as any}>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => {
    return (
        <Canvas className="absolute inset-0  h-full w-full">
            <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
        </Canvas>
    );
};

export const SignInPage = ({ className, isSignUp = false }: SignInPageProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<"form" | "success">("form");
    const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
    const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const returnTo = searchParams?.get('returnTo') || '/dashboard';

    const handleGoogleSignIn = async () => {
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                // Get verified ID token and sync to Supabase
                const idToken = await result.user.getIdToken();
                const syncRes = await fetch('/api/auth/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        displayName: result.user.displayName || '',
                    }),
                });
                const syncData = await syncRes.json();

                // Update Zustand auth state
                login({
                    id: result.user.uid,
                    email: result.user.email || '',
                    name: result.user.displayName || '',
                });

                // Set session cookie for middleware
                document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`;

                // Redirect: onboarding if needed, otherwise dashboard
                if (syncData.hasCompletedOnboarding === false) {
                    if (typeof window !== "undefined") {
                        const searchParams = new URLSearchParams(window.location.search);
                        const returnToParam = searchParams.get('returnTo');
                        router.push(returnToParam || "/dashboard");
                    } else {
                        router.push("/dashboard");
                    }
                } else {
                    router.push(returnTo);
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;
        setError("");

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsProcessing(true);
        try {
            let authUser;
            if (isSignUp) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                authUser = cred.user;
            } else {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                authUser = cred.user;
            }

            if (authUser) {
                // Get verified ID token and sync to Supabase
                const idToken = await authUser.getIdToken();
                const syncRes = await fetch('/api/auth/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        displayName: authUser.displayName || '',
                    }),
                });
                const syncData = await syncRes.json();

                // Update Zustand auth state
                login({
                    id: authUser.uid,
                    email: authUser.email || '',
                    name: authUser.displayName || email.split('@')[0] || '',
                });

                // Set session cookie for middleware
                document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`;
            }

            setReverseCanvasVisible(true);
            setTimeout(() => setInitialCanvasVisible(false), 50);
            setTimeout(() => setStep("success"), 1500);
        } catch (err: any) {
            const msg = err.code === "auth/user-not-found" ? "No account found with this email."
                : err.code === "auth/wrong-password" ? "Incorrect password. Please try again."
                    : err.code === "auth/email-already-in-use" ? "An account with this email already exists."
                        : err.code === "auth/invalid-email" ? "Please enter a valid email address."
                            : err.message || "Authentication failed.";
            setError(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={cn("flex w-[100%] flex-col min-h-screen bg-black relative", className)}>
            <div className="absolute inset-0 z-0">
                {initialCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={3}
                            containerClassName="bg-black"
                            colors={[[156, 255, 30], [156, 255, 30]]}
                            dotSize={6}
                            reverse={false}
                        />
                    </div>
                )}
                {reverseCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={4}
                            containerClassName="bg-black"
                            colors={[[156, 255, 30], [156, 255, 30]]}
                            dotSize={6}
                            reverse={true}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <div className="flex flex-1 flex-col lg:flex-row">
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="w-full mt-[120px] max-w-sm px-4">
                            <AnimatePresence mode="wait">
                                {step === "form" ? (
                                    <motion.div
                                        key="form-step"
                                        initial={{ opacity: 0, x: -60 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -60 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="space-y-6 text-center"
                                    >
                                        {/* Heading */}
                                        <div className="space-y-1">
                                            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                                                {isSignUp ? "Join PitchIQ" : "Welcome back"}
                                            </h1>
                                            <p className="text-[1.5rem] text-primary font-light">
                                                {isSignUp ? "Create your account" : "Sign in to continue"}
                                            </p>
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4"
                                            >
                                                {error}
                                            </motion.p>
                                        )}

                                        {/* Google */}
                                        <button
                                            onClick={handleGoogleSignIn}
                                            type="button"
                                            className="backdrop-blur-[2px] w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3 px-4 transition-colors"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span>{isSignUp ? "Sign up with Google" : "Sign in with Google"}</span>
                                        </button>

                                        <div className="flex items-center gap-4">
                                            <div className="h-px bg-white/10 flex-1" />
                                            <span className="text-white/40 text-sm">or</span>
                                            <div className="h-px bg-white/10 flex-1" />
                                        </div>

                                        {/* Email + Password Form */}
                                        <form onSubmit={handleSubmit} className="space-y-3 text-left">
                                            {/* Email */}
                                            <div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Email address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-5 focus:outline-none focus:border-primary bg-transparent placeholder:text-white/30 transition-colors"
                                                    required
                                                    autoComplete="email"
                                                />
                                            </div>

                                            {/* Password */}
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-5 pr-12 focus:outline-none focus:border-primary bg-transparent placeholder:text-white/30 transition-colors"
                                                    required
                                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            {/* Confirm Password (signup only) */}
                                            {isSignUp && (
                                                <div className="relative">
                                                    <input
                                                        id="confirm-password"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-5 pr-12 focus:outline-none focus:border-primary bg-transparent placeholder:text-white/30 transition-colors"
                                                        required
                                                        autoComplete="new-password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Submit */}
                                            <motion.button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="w-full rounded-full bg-primary text-black font-semibold py-3 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                                                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                                            >
                                                {isProcessing
                                                    ? (isSignUp ? "Creating account..." : "Signing in...")
                                                    : (isSignUp ? "Create account" : "Sign in")
                                                }
                                            </motion.button>
                                        </form>

                                        <p className="text-xs text-white/40 pt-4">
                                            By {isSignUp ? 'signing up' : 'signing in'}, you agree to the{" "}
                                            <Link href="#" className="underline hover:text-white/60 transition-colors">MSA</Link>,{" "}
                                            <Link href="#" className="underline hover:text-white/60 transition-colors">Product Terms</Link>,{" "}
                                            <Link href="#" className="underline hover:text-white/60 transition-colors">Privacy Notice</Link>.
                                        </p>

                                        <p className="text-sm text-white/60">
                                            {isSignUp
                                                ? <>Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link></>
                                                : <>Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></>
                                            }
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success-step"
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                                        className="space-y-6 text-center"
                                    >
                                        <div className="space-y-1">
                                            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">You&apos;re in!</h1>
                                            <p className="text-[1.25rem] text-primary font-light">Welcome to PitchIQ</p>
                                        </div>

                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.5 }}
                                            className="py-10"
                                        >
                                            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </motion.div>

                                        <motion.button
                                            onClick={() => router.push(returnTo)}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1 }}
                                            className="w-full rounded-full bg-primary text-black font-medium py-3 hover:bg-primary/90 transition-colors"
                                        >
                                            Continue to Dashboard
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
