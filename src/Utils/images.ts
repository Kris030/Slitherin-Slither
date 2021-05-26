import { MessageAttachment, User, ImageSize } from 'discord.js';
import canvas, { Image, } from 'canvas';

export async function putFaceOnImage(user: User, img: string | URL | Image, x: number, y: number, pSize?: ImageSize) {
    if (typeof img == 'string')
        img = await canvas.loadImage(img);
    else if (img instanceof URL)
        img = await canvas.loadImage(img.href);

    const cv = canvas.createCanvas(img.width, img.height), ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const av = await canvas.loadImage(user.displayAvatarURL({ format: 'png', size: pSize })), awidth = av.width, av2 = awidth / 2;
    
    ctx.beginPath();
	ctx.arc(x + av2, y + av2, av2, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
    ctx.drawImage(av, x, y);

    return new MessageAttachment(cv.toBuffer());
}