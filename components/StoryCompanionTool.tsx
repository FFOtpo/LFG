"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Mic, Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight, Plus, RotateCcw, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import axios from "axios";
import { jsPDF } from "jspdf";

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
                    <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-md flex items-center justify-center overflow-hidden">
                        {panel.imageUrl ? (
                            <img src={panel.imageUrl} alt={panel.caption} className="w-full h-full object-cover" />
                        ) : (
                            <Sparkles className="w-12 h-12 text-amber-600" />
                        )}
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showSketchbook, setShowSketchbook] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleStartChat = async () => {
        try {
            setIsProcessing(true);
            const response = await axios.post('/api/session/new', {});
            const { sessionId, message } = response.data;
            setSessionId(sessionId);

            const newMsg: Message = {
                id: Date.now().toString(),
                text: message,
                isUser: false,
                timestamp: new Date(),
            };
            setMessages([newMsg]);
            setIsListening(true); // Character speaks intro. In a real app we'd need audio for intro too.

        } catch (error) {
            console.error("Failed to start session:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); // or audio/webm
                await handleSendAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSendAudio = async (audioBlob: Blob) => {
        if (!sessionId) return;
        setIsProcessing(true);

        try {
            // Convert Blob to Base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];

                if (!base64Audio || base64Audio.length === 0) {
                    console.error("Audio recording failed or was empty");
                    setIsProcessing(false);
                    return;
                }

                try {
                    setErrorMessage(null); // Clear previous errors
                    const response = await axios.post('/api/chat', {
                        sessionId,
                        audioBase64: base64Audio
                    });

                    const { response: botText, audioBase64, imageUrl, theme, error } = response.data;

                    if (error === "AUDIO_TOO_SHORT") {
                        setErrorMessage("I couldn't hear you clearly. Can you please repeat that?");
                        setIsProcessing(false);
                        return;
                    }

                    const botMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: botText,
                        isUser: false,
                        timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, botMsg]);

                    // Play audio
                    if (audioBase64 && !isMuted) {
                        try {
                            const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
                            audio.play();
                            setIsListening(true);
                            audio.onended = () => {
                                setIsListening(false);
                            };
                        } catch (e) {
                            console.error("Audio playback error", e);
                        }
                    }

                    // Add to panels
                    if (imageUrl) {
                        const newPanel: ComicPanel = {
                            id: (Date.now() + 2).toString(),
                            imageUrl,
                            caption: theme || botText
                        };
                        setComicPanels(prev => {
                            const newPanels = [...prev, newPanel];
                            // If this is the first panel, show the sketchbook
                            if (newPanels.length === 1) {
                                setShowSketchbook(true);
                                setCurrentPanelIndex(0);
                            }
                            return newPanels;
                        });

                        // If we already have panels and just added a new one, move to it
                        if (comicPanels.length > 0) {
                            setCurrentPanelIndex(comicPanels.length);
                        }
                    }
                } catch (error) {
                    console.error("Chat failed:", error);
                } finally {
                    setIsProcessing(false);
                }
            };
        } catch (error) {
            console.error("Error processing audio:", error);
            setIsProcessing(false);
        }
    };

    const handleGenerateComic = () => {
        setShowSketchbook(true);
        setCurrentPanelIndex(0);
    };

    const handleAddMore = () => {
        setShowSketchbook(false);
    };

    const handleNewStory = async () => {
        setShowSketchbook(false);
        setMessages([]);
        setComicPanels([]);
        setCurrentPanelIndex(0);
        setSessionId(null);
        setIsListening(false);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        comicPanels.forEach((panel, index) => {
            if (index > 0) {
                doc.addPage();
            }

            // Add Title if first page
            if (index === 0) {
                doc.setFontSize(24);
                doc.text("My StoryTime Comic", 105, 20, { align: "center" });
            }

            // Add Image
            if (panel.imageUrl) {
                // We need to assume images are loaded, or use an async approach with fetch
                // straightforward way for base64 or simplistic approach:
                doc.addImage(panel.imageUrl, "JPEG", 15, index === 0 ? 40 : 20, 180, 135); // 4:3 aspect ratio approx
            }

            // Add Caption
            doc.setFontSize(14);
            const splitText = doc.splitTextToSize(panel.caption || "", 170);
            doc.text(splitText, 105, index === 0 ? 190 : 170, { align: "center" });

            // Watermark
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(40);
            doc.text("StoryTime", 105, 280, { align: "center", angle: 45 });
            doc.setTextColor(0, 0, 0); // Reset color
        });

        doc.save("my-story-comic.pdf");
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
        <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
            {/* Hero Section */}
            <AnimatePresence mode="wait">
                {!showSketchbook ? (
                    <motion.section
                        key="hero"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-8"
                    >
                        <div className="w-full max-w-md px-4">
                            {/* Title */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-center mb-8"
                            >
                                <h1 className="text-5xl font-bold text-foreground mb-2 font-handwriting">
                                    Story Time!
                                </h1>
                                <p className="text-xl text-muted-foreground font-handwriting">
                                    Create magical stories
                                </p>
                            </motion.div>

                            {/* Main Card Box */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-4 border-amber-900/20 shadow-2xl rounded-3xl p-8">
                                    <SketchbookBorder isVisible={true} />

                                    <div className="relative flex flex-col items-center gap-6">
                                        {/* Character */}
                                        <CartoonCharacter isSpeaking={isListening} />

                                        {/* Controls */}
                                        <div className="flex flex-col items-center gap-4 w-full relative">
                                            <AnimatePresence>
                                                {errorMessage && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                        className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-50 text-red-600 px-4 py-2 rounded-full border-2 border-red-200 shadow-lg font-handwriting text-lg z-10"
                                                    >
                                                        {errorMessage}
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-50 border-b-2 border-r-2 border-red-200 rotate-45"></div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="flex gap-3 justify-center items-center w-full">
                                                {!sessionId ? (
                                                    <Button
                                                        size="lg"
                                                        onClick={handleStartChat}
                                                        disabled={isProcessing}
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 font-handwriting text-xl h-16 shadow-lg"
                                                    >
                                                        <Mic className="w-6 h-6 mr-2" />
                                                        {isProcessing ? "Starting..." : "Start Chat"}
                                                    </Button>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="relative">
                                                            <AnimatePresence>
                                                                {isRecording && (
                                                                    <>
                                                                        <motion.div
                                                                            initial={{ scale: 1, opacity: 0.5 }}
                                                                            animate={{ scale: 2, opacity: 0 }}
                                                                            exit={{ scale: 1, opacity: 0 }}
                                                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                                                            className="absolute inset-0 bg-red-500 rounded-full z-0"
                                                                        />
                                                                        <motion.div
                                                                            initial={{ scale: 1, opacity: 0.5 }}
                                                                            animate={{ scale: 1.5, opacity: 0 }}
                                                                            exit={{ scale: 1, opacity: 0 }}
                                                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                                                            className="absolute inset-0 bg-red-500 rounded-full z-0"
                                                                        />
                                                                    </>
                                                                )}
                                                            </AnimatePresence>
                                                            <Button
                                                                onClick={isRecording ? stopRecording : startRecording}
                                                                disabled={isProcessing}
                                                                className={cn(
                                                                    "rounded-full h-24 w-24 shadow-xl transition-all duration-200 relative z-10",
                                                                    isRecording ? "bg-red-500 scale-110" : "bg-primary hover:bg-primary/90"
                                                                )}
                                                            >
                                                                {isRecording ? (
                                                                    <div className="flex gap-1 h-3 items-end">
                                                                        {[0, 1, 2, 3].map(i => (
                                                                            <motion.div
                                                                                key={i}
                                                                                className="w-1 bg-white rounded-full"
                                                                                animate={{ height: [4, 12, 4] }}
                                                                                transition={{
                                                                                    duration: 0.5,
                                                                                    repeat: Infinity,
                                                                                    delay: i * 0.1,
                                                                                    ease: "easeInOut"
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <Mic className="w-10 h-10 text-primary-foreground" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        <p className="text-sm font-handwriting text-muted-foreground">
                                                            {isRecording ? "Listening..." : "Tap to Speak"}
                                                        </p>
                                                    </div>
                                                )}


                                            </div>

                                            {/* Subtitles / Last Message */}
                                            {messages.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="w-full text-center mt-4"
                                                >
                                                    <div className="bg-amber-100/50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-900/10">
                                                        <p className="text-xl font-handwriting text-foreground/80">
                                                            {messages[messages.length - 1].isUser ? "..." : messages[messages.length - 1].text}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {comicPanels.length > 0 && (
                                                <Button
                                                    onClick={handleGenerateComic}
                                                    variant="secondary"
                                                    className="w-full mt-2 rounded-full font-handwriting text-lg shadow-sm"
                                                >
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    View Sketchbook ({comicPanels.length})
                                                </Button>
                                            )}


                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section
                        key="sketchbook"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="min-h-screen w-full flex items-center justify-center p-6 py-12"
                    >
                        <div className="w-full max-w-md flex flex-col gap-6">
                            {/* Header with Page Counter */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center justify-between"
                            >
                                <h2 className="text-3xl font-bold text-foreground font-handwriting">
                                    Your Story Comic
                                </h2>
                                <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-full border-2 border-amber-900/30">
                                    <span className="text-lg font-handwriting">
                                        {currentPanelIndex + 1} / {comicPanels.length}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Carousel */}
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPanelIndex}
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full"
                                    >
                                        <div className="relative w-full bg-amber-50 dark:bg-amber-950/20 rounded-3xl border-4 border-amber-900/30 shadow-2xl overflow-hidden">
                                            <SketchbookBorder isVisible={true} />
                                            <div className="relative p-6 flex flex-col items-center justify-center">
                                                <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                                                    {comicPanels[currentPanelIndex]?.imageUrl ? (
                                                        <img src={comicPanels[currentPanelIndex]?.imageUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Sparkles className="w-20 h-20 text-amber-600" />
                                                    )}
                                                </div>
                                                <p className="mt-6 text-2xl font-handwriting text-center text-foreground/90">
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
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30"
                                    size="icon"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <Button
                                    onClick={nextPanel}
                                    disabled={currentPanelIndex === comicPanels.length - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30"
                                    size="icon"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex flex-col gap-3 w-full"
                            >
                                <div className="flex flex-col items-center gap-2 mb-4">
                                    <div className="relative">
                                        <AnimatePresence>
                                            {isRecording && (
                                                <>
                                                    <motion.div
                                                        initial={{ scale: 1, opacity: 0.5 }}
                                                        animate={{ scale: 2, opacity: 0 }}
                                                        exit={{ scale: 1, opacity: 0 }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                                        className="absolute inset-0 bg-red-500 rounded-full z-0"
                                                    />
                                                    <motion.div
                                                        initial={{ scale: 1, opacity: 0.5 }}
                                                        animate={{ scale: 1.5, opacity: 0 }}
                                                        exit={{ scale: 1, opacity: 0 }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                                        className="absolute inset-0 bg-red-500 rounded-full z-0"
                                                    />
                                                </>
                                            )}
                                        </AnimatePresence>
                                        <Button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={isProcessing}
                                            className={cn(
                                                "rounded-full h-20 w-20 shadow-xl transition-all duration-200 relative z-10",
                                                isRecording ? "bg-red-500 scale-110" : "bg-primary hover:bg-primary/90"
                                            )}
                                        >
                                            {isRecording ? (
                                                <div className="flex gap-1 h-3 items-end">
                                                    {[0, 1, 2, 3].map(i => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-1 bg-white rounded-full"
                                                            animate={{ height: [4, 12, 4] }}
                                                            transition={{
                                                                duration: 0.5,
                                                                repeat: Infinity,
                                                                delay: i * 0.1,
                                                                ease: "easeInOut"
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <Mic className="w-8 h-8 text-primary-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-sm font-handwriting text-muted-foreground">
                                        {isRecording ? "Listening..." : "Tell more to continue story"}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleExportPDF}
                                    size="lg"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full font-handwriting text-xl h-14 shadow-lg mb-2"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Export PDF
                                </Button>
                                <Button
                                    onClick={handleNewStory}
                                    size="lg"
                                    variant="outline"
                                    className="w-full rounded-full font-handwriting text-xl h-14 border-2"
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
