"use client";

import {
  ArrowRight,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image: string;
  alt: string;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 7000);

    return () => {
      window.clearInterval(timer);
    };
  }, [paused, reducedMotion, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[active] ?? slides[0];

  function move(next: number) {
    setActive(
      (current) => (current + next + slides.length) % slides.length
    );

    setPaused(true);
  }

  function selectSlide(index: number) {
    setActive(index);
    setPaused(true);
  }

  return (
    <section
      className="story-carousel"
      aria-roledescription="carousel"
      aria-label="INSIPS product stories"
    >
      <div className="story-carousel-copy" aria-live="polite">
        <p className="marketing-kicker">{slide.eyebrow}</p>

        <h2>{slide.title}</h2>

        <p>{slide.body}</p>

        <Link
          className="button button-primary"
          href={slide.href}
        >
          {slide.cta}
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="story-carousel-media">
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          sizes="(max-width: 768px) 100vw, 65vw"
          className="story-carousel-image"
          priority={active === 0}
        />

        <div className="story-carousel-controls">
          <button
            className="icon-button"
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous story"
          >
            <ChevronLeft size={17} />
          </button>

          <div
            className="story-carousel-dots"
            aria-label="Choose story"
          >
            {slides.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                className={index === active ? "active" : ""}
                type="button"
                onClick={() => selectSlide(index)}
                aria-label={`Story ${index + 1}: ${item.eyebrow}`}
                aria-current={index === active ? "true" : undefined}
              />
            ))}
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={() => move(1)}
            aria-label="Next story"
          >
            <ChevronRight size={17} />
          </button>

          <button
            className="icon-button"
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={
              paused
                ? "Resume story rotation"
                : "Pause story rotation"
            }
          >
            {paused ? (
              <Play size={16} />
            ) : (
              <Pause size={16} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}