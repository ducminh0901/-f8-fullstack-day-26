const player = {
    // Hằng số để xác định hướng chuyển bài
    DIRECTION_NEXT: 1,
    DIRECTION_PREVIOUS: -1,

    // Thời gian tối thiểu (giây) để xem như đã nghe bài - nếu nhấn prev sau thời gian này sẽ về đầu bài thay vì lùi bài
    MIN_TIME_TO_RESTART: 2,

    playList: document.querySelector(".playlist"),
    songTitle: document.querySelector(".song-title"),
    artist: document.querySelector(".artist"),
    audio: document.getElementById("audio"),
    cover: document.querySelector(".cover img"),
    togglePlayBtn: document.querySelector(".btn.main"),
    playBtn: document.getElementById("play-btn"),
    prevBtn: document.querySelector(".btn:nth-child(2)"),
    nextBtn: document.querySelector(".btn:nth-child(4)"),
    repeatBtn: document.querySelector(".btn:nth-child(1)"),
    shuffleBtn: document.querySelector(".btn:nth-child(5)"),
    progressBar: document.getElementById("progress-bar"),

    isSeeking: false,
    isRepeating: localStorage.getItem("isRepeating") === "true",
    isShuffling: localStorage.getItem("isShuffling") === "true",
    shuffleHistory: [],
    songs: [
        {
            id: 1,
            title: "Blinding Lights",
            artist: "The Weeknd",
            cover: "./image/blinding-light.jpg",
            audio: "./audio/Blinding Lights.mp3",
        },
        {
            id: 2,
            title: "Die With A Smile",
            artist: "Bruno Mars,Lady Gaga",
            cover: "./image/die-with-a-smile.jpg",
            audio: "./audio/Die With A Smile.mp3",
        },
        {
            id: 3,
            title: "intro (end of the world) (extended)",
            artist: "Ariana Grande",
            cover: "./image/intro-eotw.jpg",
            audio: "./audio/intro (end of the world) (extended).mp3",
        },
        {
            id: 4,
            title: "Payphone",
            artist: "Maroon 5",
            cover: "./image/payphone.jpg",
            audio: "./audio/Payphone.mp3",
        },
        {
            id: 5,
            title: "Until I Found You",
            artist: "Stephen Sanchez",
            cover: "./image/until-i-found-u.jpg",
            audio: "./audio/Until I Found You (Em Beihold Version).mp3",
        },
    ],
    currentTrack: 0,
    getCurrentTrack() {
        return this.songs[this.currentTrack];
    },

    loadCurrentTrack() {
        const currentSong = this.getCurrentTrack();
        this.songTitle.textContent = currentSong.title;
        this.artist.textContent = currentSong.artist;
        this.audio.src = currentSong.audio;
        this.cover.src = currentSong.cover;
        this.audio.load();
    },
    handlePrevOrNext(step) {
        if (this.songs.length === this.DIRECTION_NEXT) {
            this.audio.currentTime = 0;
            this.audio.play();
            return;
        }

        if (this.isShuffling) {
            this.handleShuffle(step);
        } else {
            this.handleNormal(step);
        }
        this.loadCurrentTrack();
        this.render();
        this.audio.play();
    },
    handleShuffle(step) {
        if (step === this.DIRECTION_NEXT) {
            // NEXT
            if (this.shuffleHistory.length === 0) {
                this.shuffleHistory = [this.currentTrack];
            }

            if (this.shuffleHistory.length === this.songs.length) {
                // đã nghe hết -> reset vòng mới, bắt đầu từ bài hiện tại
                this.shuffleHistory = [this.currentTrack];
            }

            let nextTrack;
            do {
                nextTrack = Math.floor(Math.random() * this.songs.length);
            } while (this.shuffleHistory.includes(nextTrack));

            this.currentTrack = nextTrack;
            this.shuffleHistory.push(nextTrack);
        } else if (step === this.DIRECTION_PREVIOUS) {
            // PREV
            if (this.shuffleHistory.length > this.DIRECTION_NEXT) {
                this.shuffleHistory.pop(); // bỏ bài hiện tại
                this.currentTrack =
                    this.shuffleHistory[
                        this.shuffleHistory.length - this.DIRECTION_NEXT
                    ];
            } else {
                // chưa có gì để quay -> tua về đầu bài hiện tại
                this.audio.currentTime = 0;
                this.audio.play();
            }
        }
    },
    handleNormal(step) {
        this.currentTrack =
            (this.currentTrack + step + this.songs.length) % this.songs.length;
    },
    init() {
        this.loadCurrentTrack();
        this.togglePlayBtn.addEventListener("click", () => {
            if (this.audio.paused) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        });
        this.audio.addEventListener("play", () => {
            player.playBtn.classList.remove("fa-play");
            player.playBtn.classList.add("fa-pause");
        });
        this.audio.addEventListener("pause", () => {
            player.playBtn.classList.remove("fa-pause");
            player.playBtn.classList.add("fa-play");
        });
        this.nextBtn.addEventListener("click", () => {
            this.handlePrevOrNext(this.DIRECTION_NEXT);
        });
        this.prevBtn.addEventListener("click", () => {
            if (this.audio.currentTime > this.MIN_TIME_TO_RESTART) {
                this.audio.currentTime = 0;
            } else this.handlePrevOrNext(this.DIRECTION_PREVIOUS);
        });

        this.audio.addEventListener("timeupdate", () => {
            const { duration, currentTime } = this.audio;
            if (!duration || this.isSeeking) return;

            const progress = Math.floor((currentTime / duration) * 100);
            this.progressBar.value = progress;
        });
        this.progressBar.addEventListener("mousedown", () => {
            this.isSeeking = true;
        });

        this.progressBar.addEventListener("mouseup", (e) => {
            this.isSeeking = false;
            const nextProgress = e.target.value; // Get the new progress value
            const nextDuration = (nextProgress / 100) * this.audio.duration; // Calculate nextDuration
            this.audio.currentTime = nextDuration; // Update currentTime
        });

        this.audio.addEventListener("ended", () => {
            if (this.isRepeating) {
                this.audio.play();
            } else {
                this.handlePrevOrNext(this.DIRECTION_NEXT);
            }
        });

        this.repeatBtn.addEventListener("click", () => {
            this.isRepeating = !this.isRepeating;
            this.repeatBtn.classList.toggle("active", this.isRepeating);
            localStorage.setItem("isRepeating", this.isRepeating);
        });

        this.shuffleBtn.addEventListener("click", () => {
            this.isShuffling = !this.isShuffling;
            this.shuffleBtn.classList.toggle("active", this.isShuffling);
            localStorage.setItem("isShuffling", this.isShuffling);
        });

        this.render();
        this.repeatBtn.classList.toggle("active", this.isRepeating);
        this.shuffleBtn.classList.toggle("active", this.isShuffling);
    },

    render() {
        const playlist = document.querySelector(".playlist");
        playlist.innerHTML = this.songs
            .map(
                (song, index) => `
             <div class="track ${this.currentTrack === index ? "active" : ""}">
                    <img src="${song.cover}" alt="" />
                    <div class="track-info">
                        <div class="track-title">${song.title}</div>
                        <div class="track-artist">${song.artist}</div>
                    </div>
                </div>
        `
            )
            .join("");
        const tracks = playlist.querySelectorAll(".track");
        tracks.forEach((track, index) => {
            track.addEventListener("click", () => {
                this.currentTrack = index;
                this.loadCurrentTrack();
                this.render();
                this.audio.play();
            });
        });
    },
};

player.init();
