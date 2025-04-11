// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
    let bgData = bgImg.data;
    let fgData = fgImg.data;
    let bgWidth = bgImg.width;
    let bgHeight = bgImg.height;
    let fgWidth = fgImg.width;
    let fgHeight = fgImg.height;

    for (let fy = 0; fy < fgHeight; fy++) {
        for (let fx = 0; fx < fgWidth; fx++) {
            let bgX = fx + fgPos.x;
            let bgY = fy + fgPos.y;

            // Ignore pixel outside 
            if (bgX < 0 || bgX >= bgWidth || bgY < 0 || bgY >= bgHeight) {
                continue;
            }

            // pixel index 
            let fgIndex = (fy * fgWidth + fx) * 4;
            let bgIndex = (bgY * bgWidth + bgX) * 4;

            // normalize alpha 
            let alphaFg = (fgData[fgIndex + 3] / 255) * fgOpac;
            let alphaBg = bgData[bgIndex + 3] / 255;
            let alphaOut = alphaFg + alphaBg * (1 - alphaFg);

            for (let i = 0; i < 3; i++) { // R, G, B
                let fgColor = fgData[fgIndex + i] / 255;
                let bgColor = bgData[bgIndex + i] / 255;

                // blending
                let blended = (fgColor * alphaFg + bgColor * alphaBg * (1 - alphaFg)) / alphaOut;

                // Convert to [0,255]
                bgData[bgIndex + i] = Math.round(blended * 255);
            }

            // chanel alpha
            bgData[bgIndex + 3] = Math.round(alphaOut * 255);
        }
    }
}

