import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SkipBack, Play, Pause, SkipForward, MicVocal, Volume2, Volume1, Volume, VolumeX, VolumeOff, Share } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Progress } from "./ui/progress";

import '@public/CSS/song-controls.css';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import ShareSong from "./shareSong";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import Lyrics from "./lyrics";

interface songControlsInterface {
    songRef: any;
    songVal: string;
    isPlaying: boolean;
    setIsPlaying: any;
    optionalAppear: boolean;
    volumeVal: number;
    setVolumeVal: any;
    image: string;
    songCreator: string;
    handleSkipSong: (back: boolean) => void;
    appearBar?: boolean;
    setAppearBar?: any;
    setOptAppear?: any;
    id: string;
}

interface miniPlayerInterface {
    albumCover: string;
    songRef: any;
    songVal: string;
    isPlaying: boolean;
    setIsPlaying: any;
    optionalAppear: boolean;
    volumeVal: number;
    setVolumeVal: any;
    songCreator: string;
    handleSkipSong: (back: boolean) => void;
}

export const SongControls = ({
    songRef,
    songVal,
    isPlaying,
    setIsPlaying,
    optionalAppear,
    volumeVal,
    setVolumeVal,
    image,
    songCreator,
    handleSkipSong,
    id
}: songControlsInterface) => {
    const [appearBar, setAppearBar] = useState(true);
    const [optAppear, setOptAppear] = useState(optionalAppear);
    const [mediumScreen, setMediumScreen] = useState(false);
    const [currentTimeVal, setCurrentTimeVal] = useState(0);
    const [songTime, setSongtime] = useState(0);

    const pressedKeyOne = useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "j") {
                handleSkipSong(true);
            }
            if (e.key === "l") {
                handleSkipSong(false);
            }
            if (e.key === "k") {
                setIsPlaying(!isPlaying);
            }
            if (e.key === "h") {
                hideControls();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleSkipSong, hideControls]);

    const [sliderValue, setSliderValue] = useState(0);

    function hideControls() {
        setAppearBar(!appearBar);
        setOptAppear(appearBar);
    }

    function handleTogglePlayback() {
        if (!songRef.current || songVal == "") return;
        if (songRef.current.paused) {
            songRef.current.play();
            setIsPlaying(true);
        } else {
            songRef.current.pause();
            setIsPlaying(false);
        }
    }

    const useEffectConst = () => {
        const song = songRef.current;
        if (!song) return;

        const updateTime = () => {
            if (song.duration) {
                setSliderValue((song.currentTime / song.duration) * 100);
            }
            setCurrentTimeVal(song.currentTime);
        };

        setSongtime(song.duration);

        song.addEventListener("timeupdate", updateTime);

        return () => {
            song.removeEventListener("timeupdate", updateTime);
        };
    }

    useEffect(() => {
        useEffectConst();
    }, []);

    useEffect(() => {
        useEffectConst();
    }, [handleSkipSong]);

    useEffect(() => {
        const isScreenSmall = () => {
            if (window.innerWidth < 768) setMediumScreen(true);
            else setMediumScreen(false);
        };
        isScreenSmall();

        window.addEventListener("resize", isScreenSmall);

        return () => window.addEventListener("resize", isScreenSmall);
    });

    // this basically just adds support for stuff like media buttons and mobile media players in notification tray

    // had never heard of this before but i guess better late than never
    useEffect(() => {
        const song = songRef.current;
        if (!song) return;
    
        if ("mediaSession" in navigator) {
            try {
                navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
                navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
                navigator.mediaSession.setActionHandler("previoustrack", () => handleSkipSong(true));
                navigator.mediaSession.setActionHandler("nexttrack", () => handleSkipSong(false));
    
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: songVal,
                    artist: songCreator,
                    album: "Yandhi",
                    artwork: [
                        {
                            src: image,
                            sizes: "96x96",
                            type: "image/jpg",
                        },
                    ],
                });

                navigator.mediaSession.setPositionState({
                    duration: songRef.current.duration || 0,
                    position: songRef.current.currentTime || 0,
                })
            } catch (e) {
                console.log("Error setting media session handlers:", e);
            }
        }
    }, [songTime, currentTimeVal, handleSkipSong, songVal, songCreator, image, songRef]);    

    return (
        <>
            {!mediumScreen ? (
                <div
                    className={`fixed bottom-2 rounded-2xl w-full max-w-[95.5vw]
                    left-1/2 -translate-x-1/2 py-3 px-3 bg-primary-foreground/80 backdrop-blur-lg border-2 border-secondary
                        flex items-center transition-all duration-500 shadow-lg ${appearBar ? "translate-y-0" : "translate-y-24"
                        }`}
                    // onClick={hideControls}
                    onKeyDown={(e) => pressedKeyOne}
                >
                    <DefaultSongControls
                        songRef={songRef}
                        songVal={songVal}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        optionalAppear={optionalAppear}
                        volumeVal={volumeVal}
                        setVolumeVal={setVolumeVal}
                        image={image}
                        songCreator={songCreator}
                        handleSkipSong={handleSkipSong}
                        appearBar={appearBar}
                        setOptAppear={setOptAppear}
                        id={id}
                    />
                </div>
            ) : (
                <div>
                    <Drawer>
                        <DrawerTrigger asChild>
                            <div
                                className={`fixed bottom-2 rounded-2xl w-full max-w-[92vw] left-1/2 -translate-x-1/2
                                    bg-primary-foreground/80 backdrop-blur-lg border-2 border-secondary flex items-center transition-all duration-500 shadow-lg overflow-hidden
                                ${appearBar ? "translate-y-0" : "translate-y-24"
                                    }`}
                            >
                                <SongControlsSmall
                                    songRef={songRef}
                                    songVal={songVal}
                                    isPlaying={isPlaying}
                                    setIsPlaying={setIsPlaying}
                                    optionalAppear={optionalAppear}
                                    volumeVal={volumeVal}
                                    setVolumeVal={setVolumeVal}
                                    image={image}
                                    songCreator={songCreator}
                                    handleSkipSong={handleSkipSong}
                                    appearBar={appearBar}
                                    setOptAppear={setOptAppear}
                                    id={id}
                                />
                            </div>
                        </DrawerTrigger>
                        <DrawerContent className="max-h-[100%] h-[100%] rounded-t-none">
                            <MiniPlayer
                                albumCover={image}
                                songRef={songRef}
                                songVal={songVal}
                                isPlaying={isPlaying}
                                setIsPlaying={setIsPlaying}
                                optionalAppear={appearBar}
                                songCreator={songCreator}
                                handleSkipSong={handleSkipSong}
                                volumeVal={volumeVal}
                                setVolumeVal={setVolumeVal}
                            />
                            {/* <Button className="w-fit mx-auto m-12 opacity-0">My balls</Button> */}
                        </DrawerContent>
                    </Drawer>
                </div>
            )}
        </>
    );
};

const DefaultSongControls = ({
    songRef,
    songVal,
    isPlaying,
    setIsPlaying,
    optionalAppear,
    volumeVal,
    setVolumeVal,
    image,
    songCreator,
    handleSkipSong,
    appearBar,
    setAppearBar,
    setOptAppear,
    id
}: songControlsInterface) => {
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [currentTimeVal, setCurrentTimeVal] = useState(0);
    const [songTime, setSongtime] = useState(0);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    const useEffectConst = () => {
        const song = songRef.current;
        if (!song) return;

        const updateTime = () => {
            if (song.duration) {
                setSliderValue((song.currentTime / song.duration) * 100);
            }
            setCurrentTimeVal(song.currentTime);
        };

        setSongtime(song.duration);

        song.addEventListener("timeupdate", updateTime);

        return () => {
            song.removeEventListener("timeupdate", updateTime);
        };
    }

    useEffect(() => {
        useEffectConst();
    }, []);

    useEffect(() => {
        useEffectConst();
    }, [handleSkipSong]);

    function hideControls() {
        setAppearBar(!appearBar);
        setOptAppear(appearBar);
    }

    function handleTogglePlayback() {
        if (!songRef.current || songVal == "") return;
        if (songRef.current.paused) {
            songRef.current.play();
            setIsPlaying(true);
        } else {
            songRef.current.pause();
            setIsPlaying(false);
        }
    }

    const pressedKeyOne = useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "j") {
                handleSkipSong(true);
            }
            if (e.key === "l") {
                handleSkipSong(false);
            }
            if (e.key === "k") {
                setIsPlaying(!isPlaying);
            }
            if (e.key === "h") {
                hideControls();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleSkipSong, hideControls]);

    const handleSliderChange = (value: number[]) => {
        const newValue = value[0];
        setSliderValue(newValue)
        if (songRef.current) {
            const newTime = (newValue / 100) * songRef.current.duration;
            songRef.current.currentTime = newTime;
            setCurrentTimeVal(newTime);
        }
    }

    return (
        <>
            <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-3 select-none w-full">
                    <Image src={image} alt={image} width={80} height={80} className="rounded-lg" />
                    <div>
                        <div className="font-semibold text-md">
                            {songVal || "No Track Found"}
                        </div>
                        <div className="text-sm text-muted-foreground">{songCreator || "Unknown"}</div>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-2 ml-2">
                        <Button
                            size="icon"
                            className={`p-5 rounded-full ${songVal !== "" ? "" : "opacity-50 cursor-not-allowed"}`}
                            variant="ghost"
                            onClick={() => handleSkipSong(true)}
                            onKeyDown={() => pressedKeyOne}
                        >
                            <SkipBack />
                        </Button>
                        <Button
                            className={`p-5 rounded-full ${songVal !== "" ? "" : "opacity-50 cursor-not-allowed"}`}
                            size="icon"
                            onClick={() => setIsPlaying(songVal !== "" && !isPlaying)}
                            onKeyDown={() => pressedKeyOne}
                        >
                            {!isPlaying ? <Play /> : <Pause />}
                        </Button>
                        <Button
                            size="icon"
                            className={`p-5 rounded-full ${songVal !== "" ? "" : "opacity-50 cursor-not-allowed"}`}
                            variant="ghost"
                            onClick={() => handleSkipSong(false)}
                            onKeyDown={() => pressedKeyOne}
                        >
                            <SkipForward />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground/80 w-12 text-right">{formatTime(currentTimeVal)}</div>
                        <Slider value={[sliderValue]} max={100} step={1} className={cn("w-full [&>:last-child>span]:bg-primary")} onValueChange={handleSliderChange} />
                        <div className="text-sm text-muted-foreground/80">{isNaN(songTime) ? '0:00' : formatTime(songTime)}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end w-full select-none" onClick={(e) => e.stopPropagation()}>
                    <div className="items-center flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="rounded-full" variant='secondary' size='icon'>
                                    <Share size='18' />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Share song</DialogTitle>
                                </DialogHeader>
                                <ShareSong />
                            </DialogContent>
                        </Dialog>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="rounded-full" variant='secondary' size='icon'>
                                    <MicVocal size='18' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 h-full rounded-xl bg-background">
                                <Lyrics />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="w-1/2 flex gap-3 items-center">
                        <VolumeSlider className="[&>:last-child>span]:bg-primary [&>:last-child>span]:border-transparent [&>:first-child>span]:opacity-70" value={[volumeVal]} onValueChange={setVolumeVal} />
                        <Label className="w-12 text-right">{volumeVal}%</Label>
                    </div>
                </div>
            </div>
        </>
    );
};

const SongControlsSmall = ({
    songRef,
    songVal,
    isPlaying,
    setIsPlaying,
    optionalAppear,
    volumeVal,
    setVolumeVal,
    image,
    songCreator,
    handleSkipSong,
    appearBar,
    setAppearBar,
    setOptAppear,
    id,
}: songControlsInterface) => {
    const [sliderValue, setSliderValue] = useState(0);

    const useEffectConst = () => {
        const song = songRef.current;
        if (!song) return;

        const updateTime = () => {
            if (song.duration) {
                setSliderValue(Number(((song.currentTime / song.duration) * 100).toFixed(0)));
            }
        };

        song.addEventListener("timeupdate", updateTime);

        return () => {
            song.removeEventListener("timeupdate", updateTime);
        };
    }

    useEffect(() => {
        useEffectConst();
    }, []);

    useEffect(() => {
        useEffectConst();
    }, [handleSkipSong]);

    return (
        <>
            <div className="flex flex-col w-full">
                <div className="flex items-center py-3 px-3 justify-between">
                    <div className="flex items-center gap-2 flex-1 select-none max-w-[70%] shadowed-text relative">
                        <Image
                            src={image}
                            alt={image}
                            width={60}
                            height={60}
                            className="rounded-lg"
                        />
                        <div className="overflow-hidden">
                            <div className="font-semibold overflow-hidden whitespace-pre text-ellipsis w-fit shadowed-text-div">
                                {songVal !== "" ? songVal : "No Track Found"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {songCreator}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button className={`p-5 rounded-full ${songVal !== "" ? "" : "opacity-50 cursor-not-allowed"}`} size="icon" onClick={() => setIsPlaying(songVal !== "" && !isPlaying)}>
                            {!isPlaying ? <Play className="-translate-x-px" /> : <Pause className="-translate-x-px" />}
                        </Button>
                        <Button size="icon" className={`p-5 rounded-full ${songVal !== "" ? "" : "opacity-50 cursor-not-allowed"}`} variant="ghost" onClick={() => handleSkipSong(false)}>
                            <SkipForward />
                        </Button>
                    </div>
                </div>
                <Progress
                    value={sliderValue}
                    className="transition-all duration-1000 h-1 rounded-none w-full"
                />
            </div>
        </>
    );
};

const MiniPlayer = ({
    albumCover,
    isPlaying,
    setIsPlaying,
    handleSkipSong,
    optionalAppear,
    songCreator,
    songRef,
    songVal,
    setVolumeVal,
    volumeVal,
}: miniPlayerInterface) => {
    const [sliderValue, setSliderValue] = useState(0);
    const [currentTimeVal, setCurrentTimeVal] = useState(0);
    const [songTime, setSongtime] = useState(0);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    const useEffectConst = () => {
        const song = songRef.current;
        if (!song) return;

        const updateTime = () => {
            if (song.duration) {
                setSliderValue((song.currentTime / song.duration) * 100);
            }
            setCurrentTimeVal(song.currentTime);
        };

        setSongtime(song.duration);

        song.addEventListener("timeupdate", updateTime);

        return () => {
            song.removeEventListener("timeupdate", updateTime);
        };
    }

    useEffect(() => {
        useEffectConst();
    }, []);

    useEffect(() => {
        useEffectConst();
    }, [handleSkipSong]);

    const handleSliderChange = (value: number[]) => {
        const newValue = value[0];
        setSliderValue(newValue)
        if (songRef.current) {
            const newTime = (newValue / 100) * songRef.current.duration;
            songRef.current.currentTime = newTime;
            setCurrentTimeVal(newTime);
        }
    }

    const VolumeIcon = ({ ...props }) => {
        if (songRef.current.muted) {
            return <VolumeOff {...props} />;
        }

        if (volumeVal > 60) {
            return <Volume2 {...props} />;
        } else if (volumeVal < 60 && volumeVal > 30) {
            return <Volume1 {...props} />;
        } else if (volumeVal === 0) {
            return <VolumeX {...props} />;
        } else {
            return <Volume {...props} />;
        }
    }

    return (
        <ScrollArea className="-[calc(100vh-4rem)] w-full">
            <div className={`p-8 flex flex-col gap-2 transition-all bg-primary-foreground w-full`}>
                <div className="flex flex-col gap-4 mt-0">
                    <div className="flex flex-col relative items-center">
                        <Image src={albumCover} alt="Album Cover" width={345} height={340} className="rounded-xl shadow-lg" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <div className="flex flex-col overflow-hidden flex-1">
                            <div className="text-2xl font-semibold w-full scrolling-text relative select-none leading-none">{songVal || "Unknown"}</div>
                            <div className="text-md text-muted-foreground">{songCreator || "Unknown"}</div>
                        </div>
                        <div className="items-center flex gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="rounded-full" variant='secondary' size='icon'>
                                        <Share />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90%] rounded-xl">
                                    <DialogHeader>
                                        <DialogTitle>Share song</DialogTitle>
                                    </DialogHeader>
                                    <ShareSong />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-8 w-full mt-10">
                    <div className="w-full">
                        <Slider value={[sliderValue]} max={100} step={1} className="w-full [&>:last-child>span]:bg-primary transition-all duration-500" onValueChange={handleSliderChange} />
                    </div>
                    <div className="flex gap-1 items-center">
                        <div className="w-full">{formatTime(currentTimeVal)}</div>
                        <div className="flex gap-2 items-center w-full scale-110">
                            <Button
                                size="icon"
                                className={cn('p-6 rounded-full bg-transparent focus:bg-transparent', songVal !== "" || songVal !== null && 'opacity-50 cursor-not-allowed')}
                                variant="ghost"
                                onClick={() => handleSkipSong(true)}
                            >
                                <SkipBack size='32' />
                            </Button>
                            <Button
                                className={cn('p-6 rounded-full focus:bg-primary', songVal !== "" || songVal !== null && 'opacity-50 cursor-not-allowed')}
                                size="icon"
                                onClick={() => setIsPlaying(songVal !== "" && !isPlaying)}
                            >
                                {!isPlaying ? <Play size='32' /> : <Pause size='32' />}
                            </Button>
                            <Button
                                size="icon"
                                className={cn('p-6 rounded-full bg-transparent focus:bg-transparent', songVal !== "" || songVal !== null && 'opacity-50 cursor-not-allowed')}
                                variant="ghost"
                                onClick={() => handleSkipSong(false)}
                            >
                                <SkipForward size='32' />
                            </Button>
                        </div>
                        <div className="w-full text-right">
                            {isNaN(songTime) ? '0:00' : formatTime(songTime)}
                        </div>
                    </div>
                </div>
                <div className="flex mt-12 md:mt-0 h-full items-center gap-2">
                    <Button onClick={() => songRef.current && (songRef.current.muted = !songRef.current.muted)} variant='outline' className="rounded-xl">
                        <VolumeIcon size='18' />
                    </Button>
                    <VolumeSlider className="[&>:last-child>span]:bg-primary [&>:first-child>span]:opacity-70" value={[Number(volumeVal)]} onValueChange={setVolumeVal} />
                    <Label className="w-12 text-right">{volumeVal}%</Label>
                </div>
            </div>
        </ScrollArea>
    );
};

type SliderProps = React.ComponentProps<typeof Slider>;

function VolumeSlider({ className, ...props }: SliderProps) {
    return (
        <Slider
            defaultValue={[100]}
            max={100}
            step={1}
            className={cn("w-full", className)}
            {...props}
        />
    );
}
