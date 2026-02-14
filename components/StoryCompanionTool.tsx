"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Mic, Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface ComicPanel {
    id: string;
    imageUrl: string;
    caption: string;
}

// Sketchbook SVG Border Component
const SketchbookBorder = ({ isVisible }: { isVisible: boolean }) => {
    const [pathLength, setPathLength] = useState(0);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    return (
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <filter id="sketch-wobble">
                    <feTurbulence baseFrequency="0.02" numOctaves="2" seed={42} result="turbulence" />
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" />
                </filter>
            </defs>
            <motion.path
                ref={pathRef}
                d="M2,2 L98,2 L98,98 L2,98 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-amber-700/40"
                style={{ filter: "url(#sketch-wobble)" }}
                initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }}
                animate={{ strokeDashoffset: isVisible ? 0 : pathLength }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />
        </svg>
    );
};

// Cartoon Character Component
const CartoonCharacter = ({ isSpeaking }: { isSpeaking: boolean }) => {
    return (
        <motion.div
            className="relative w-48 h-48 md:w-64 md:h-64"
            animate={{
                scale: isSpeaking ? [1, 1.05, 1] : 1,
            }}
            transition={{
                duration: 0.5,
                repeat: isSpeaking ? Infinity : 0,
            }}
        >
            <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Head */}
                <motion.circle
                    cx="100"
                    cy="80"
                    r="50"
                    fill="#FFD93D"
                    stroke="#2D3436"
                    strokeWidth="3"
                    animate={{
                        scale: isSpeaking ? [1, 1.02, 1] : 1,
                    }}
                />

                {/* Eyes */}
                <circle cx="85" cy="75" r="8" fill="#2D3436" />
                <circle cx="115" cy="75" r="8" fill="#2D3436" />
                <circle cx="87" cy="73" r="3" fill="white" />
                <circle cx="117" cy="73" r="3" fill="white" />

                {/* Mouth */}
                <motion.path
                    d={isSpeaking ? "M 80 95 Q 100 105 120 95" : "M 85 95 Q 100 100 115 95"}
                    fill="none"
                    stroke="#2D3436"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* Body */}
                <rect x="75" y="130" width="50" height="60" rx="10" fill="#6C5CE7" stroke="#2D3436" strokeWidth="3" />

                {/* Arms */}
                <motion.line
                    x1="75"
                    y1="145"
                    x2="50"
                    y2="160"
                    stroke="#2D3436"
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{
                        rotate: isSpeaking ? [0, -10, 0] : 0,
                    }}
                    style={{ originX: "75px", originY: "145px" }}
                />
                <motion.line
                    x1="125"
                    y1="145"
                    x2="150"
                    y2="160"
                    stroke="#2D3436"
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{
                        rotate: isSpeaking ? [0, 10, 0] : 0,
                    }}
                    style={{ originX: "125px", originY: "145px" }}
                />
            </svg>

            {/* Speaking indicator */}
            <AnimatePresence>
                {isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -right-4 top-8 flex gap-1"
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Comic Panel Component
const ComicPanelCard = ({ panel, index }: { panel: ComicPanel; index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative break-inside-avoid mb-4"
        >
            <div className="relative bg-amber-50 dark:bg-amber-950/20 rounded-lg overflow-hidden border-2 border-amber-900/30 shadow-lg">
                <SketchbookBorder isVisible={isInView} />
                <div className="relative p-4">
                    <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-md flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-amber-600" />
                    </div>
                    <p className="mt-3 text-sm font-handwriting text-center text-foreground/80">
                        {panel.caption}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

// Main Component
const StoryCompanionTool = () => {
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showSketchbook, setShowSketchbook] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0);

    const handleStartChat = () => {
        setIsListening(true);
        // Simulate initial greeting
        setTimeout(() => {
            setMessages([
                {
                    id: "1",
                    text: "Hi there! I'm your story companion. Let's create an amazing adventure together!",
                    isUser: false,
                    timestamp: new Date(),
                },
            ]);
        }, 500);
    };

    const handleGenerateComic = () => {
        setShowSketchbook(true);
        setCurrentPanelIndex(0);
        // Simulate comic generation
        const newPanels: ComicPanel[] = [
            { id: "1", imageUrl: "", caption: "Once upon a time..." },
            { id: "2", imageUrl: "", caption: "A brave hero appeared!" },
            { id: "3", imageUrl: "", caption: "They went on an adventure!" },
            { id: "4", imageUrl: "", caption: "And found treasure!" },
        ];
        setComicPanels(newPanels);
    };

    const handleAddMore = () => {
        const newPanel: ComicPanel = {
            id: `${comicPanels.length + 1}`,
            imageUrl: "",
            caption: "The adventure continues...",
        };
        setComicPanels([...comicPanels, newPanel]);
        setCurrentPanelIndex(comicPanels.length);
    };

    const handleNewStory = () => {
        setShowSketchbook(false);
        setMessages([]);
        setComicPanels([]);
        setCurrentPanelIndex(0);
        setIsListening(false);
    };

    const nextPanel = () => {
        if (currentPanelIndex < comicPanels.length - 1) {
            setCurrentPanelIndex(currentPanelIndex + 1);
        }
    };

    const prevPanel = () => {
        if (currentPanelIndex > 0) {
            setCurrentPanelIndex(currentPanelIndex - 1);
        }
    };

    // Auto-advance carousel
    useEffect(() => {
        if (showSketchbook && comicPanels.length > 0) {
            const timer = setInterval(() => {
                setCurrentPanelIndex((prev) => (prev + 1) % comicPanels.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [showSketchbook, comicPanels.length]);

    return (
        <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 landscape:aspect-video">
            {/* Hero Section */}
            <AnimatePresence mode="wait">
                {!showSketchbook ? (
                    <motion.section
                        key="hero"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full flex items-center justify-center px-8 py-6"
                    >
                        <div className="flex items-center justify-between gap-8 w-full max-w-6xl">
                            {/* Left: Title */}
                            <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex-shrink-0"
                            >
                                <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-2 font-handwriting">
                                    Story Time!
                                </h1>
                                <p className="text-xl lg:text-2xl text-muted-foreground font-handwriting">
                                    Create magical stories
                                </p>
                            </motion.div>

                            {/* Center: Character */}
                            <div className="flex-shrink-0">
                                <CartoonCharacter isSpeaking={isListening} />
                            </div>

                            {/* Right: Controls */}
                            <motion.div
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col items-center gap-4 flex-shrink-0"
                            >
                                <div className="flex gap-3">
                                    <Button
                                        size="lg"
                                        onClick={handleStartChat}
                                        disabled={isListening}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 font-handwriting text-xl h-16"
                                    >
                                        <Mic className="w-6 h-6 mr-2" />
                                        {isListening ? "Listening..." : "Start Chat"}
                                    </Button>

                                    {isListening && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            onClick={() => setIsMuted(!isMuted)}
                                            className="rounded-full h-16 w-16"
                                        >
                                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                        </Button>
                                    )}
                                </div>

                                {isListening && messages.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full max-w-sm"
                                    >
                                        <div className="bg-amber-100 dark:bg-amber-900/40 rounded-2xl p-4 mb-4 border-2 border-amber-900/30">
                                            <p className="text-lg font-handwriting text-center">
                                                {messages[messages.length - 1].text}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleGenerateComic}
                                            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full font-handwriting text-xl h-14"
                                        >
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Create My Comic!
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section
                        key="sketchbook"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full w-full flex items-center justify-center p-8"
                    >
                        <div className="w-full h-full max-w-7xl flex flex-col">
                            {/* Header with Page Counter */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center justify-between mb-6"
                            >
                                <h2 className="text-4xl font-bold text-foreground font-handwriting">
                                    Your Story Comic
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-full border-2 border-amber-900/30">
                                        <span className="text-xl font-handwriting">
                                            {currentPanelIndex + 1} / {comicPanels.length}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Carousel */}
                            <div className="flex-1 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPanelIndex}
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.4 }}
                                        className="h-full w-full"
                                    >
                                        <div className="relative h-full bg-amber-50 dark:bg-amber-950/20 rounded-3xl border-4 border-amber-900/30 shadow-2xl overflow-hidden">
                                            <SketchbookBorder isVisible={true} />
                                            <div className="relative h-full p-8 flex flex-col items-center justify-center">
                                                <div className="w-full max-w-2xl aspect-video bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <Sparkles className="w-24 h-24 text-amber-600" />
                                                </div>
                                                <p className="mt-6 text-3xl font-handwriting text-center text-foreground/90">
                                                    {comicPanels[currentPanelIndex]?.caption}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                <Button
                                    onClick={prevPanel}
                                    disabled={currentPanelIndex === 0}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-14 w-14 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30"
                                    size="icon"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </Button>
                                <Button
                                    onClick={nextPanel}
                                    disabled={currentPanelIndex === comicPanels.length - 1}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-14 w-14 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30"
                                    size="icon"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </Button>
                            </div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex justify-center gap-4 mt-6"
                            >
                                <Button
                                    onClick={handleAddMore}
                                    size="lg"
                                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-8 font-handwriting text-xl h-14"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add More
                                </Button>
                                <Button
                                    onClick={handleNewStory}
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full px-8 font-handwriting text-xl h-14 border-2"
                                >
                                    <RotateCcw className="w-5 h-5 mr-2" />
                                    New Story
                                </Button>
                            </motion.div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        
        .font-handwriting {
          font-family: 'Caveat', cursive;
        }
      `}</style>
        </div>
    );
};

export default StoryCompanionTool;
