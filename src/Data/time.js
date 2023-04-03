const converter = (seconds) => {
    seconds = Number(seconds);
    seconds = Math.round(seconds);
    if (isNaN(seconds)) return 'err';

    if (seconds < 3600) {
        return `${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2, '0')}`;
    }
    else {
        return `${Math.floor(seconds/3600)}:${(Math.floor(seconds/60)-Math.floor(seconds/3600)*60).toString().padStart(2, '0')}:${(seconds%60).toString().padStart(2, '0')}`;
    }
}

module.exports = converter;
