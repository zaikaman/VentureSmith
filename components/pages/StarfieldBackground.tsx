import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './StarfieldBackground.css';

const StarfieldBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = canvas.parentElement?.clientHeight || window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const stars: { x: number; y: number; z: number; size: number }[] = [];
        const numStars = 500;

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width - width / 2,
                y: Math.random() * height - height / 2,
                z: Math.random() * width,
                size: Math.random() * 2 + 1,
            });
        }

        const draw = () => {
            if (!ctx) return;
            
            ctx.fillStyle = 'rgb(12, 12, 13)';
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                const perspective = width / star.z;
                const x = star.x * perspective;
                const y = star.y * perspective;
                const size = star.size * perspective;

                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        };

        const update = () => {
            stars.forEach(star => {
                star.z -= 1.5;
                if (star.z <= 0) {
                    star.z = width;
                }
            });
        };
        
        const tick = () => {
            draw();
            update();
        };

        gsap.ticker.add(tick);

        const handleResize = () => {
            width = window.innerWidth;
            height = canvas.parentElement?.clientHeight || window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            gsap.ticker.remove(tick);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="starfield-canvas" />;
};

export default StarfieldBackground;
