# Fractal Wonder

This is a personal project to explore various strategies for AI-assisted coding, and making something beautiful while
doing so.

I'm using AI to help with advanced refactoring, boilerplate, creating UI components, and taking a stab at implementing
features. It's not great at some of these things. Of the models I've tried, only v0 can actually come up with decent
code for fairly complex tasks.

When I was growing up, I was so fascinated by the beauty of Fractals... I wrote my first program to display the
Mandelbrot set on an Apple II+ in AppleSoft BASIC. It took days to complete a monochrome 280x192 pixel image but it was
glorious.

This project recreates some of that magic and lets me explore the Mandelbrot set in a web browser, with much better
graphics and performance. :smile:

## Running the project

```
yarn install
yarn dev
```

Then open http://localhost:5173/ and enjoy. I'm currently not ready to publish this anywhere yet, so dev mode is all I'm
using for now.

## Usage

the UI is pretty simple... When you move the pointer, the UI shows up at the bottom of the screen. Dragging across the
screen will move the fractal, and the scroll wheel will zoom in and out.

## Stack

This project uses Yarn, Vite, TypeScript, and React.

## So how is AI assisted coding?

Some models are worse than others. Most of them are alright for very specific (simple-ish) tasks, but make an awful mess
if you're not careful.

You still need to know what you're doing, and understand how to construct software. You need to learn how to ask for
what you want in a specific unambiguous way.

Frequently it comes up with proposed solutions that are just plain wrong. If you call it out on its sloppy work, ask it
to be more thorough and analyse the problem step by step, it will sometimes come up with a better answer. It gets pretty
frustrating to first ask a question, then ask it to give a better answer. It tends to apologise and promise to be more
thorough right off the bat for future questions, but it doesn't really do that anyway.

It tends to be keen to add code and complexity and doesn't really know how to keep things as clean and elegant as
possible. It isn't great at restructuring code to follow best practices.

I've been using Claude 3.5 and 3.7 Sonnet, ChatGPT 4o, and v0. The most impressive at understanding my code and being
actually helpful is definitely v0.

### Some examples of AI interactions.

An example of using DeepSeek: At some point I wanted to create a progress indicator. I have a callback that receives a
number between 0 and 1, and I wanted a UI component to display an indication of progress. I'm using chadcn components,
but the AI gave me a component that used tailwind plugins and required DaisyUI. When I said the component didn't display
properly, it gave me a solution that didn't use tailwind but created an SVG instead. I then pointed out that I'm using
chadcn (which it should have seen because the code it was looking at already uses chadcn components), and it gave me
generic instructions on installing chadcn. At that point I just looked up the chadcn docs and implemented it myself.

V0 is much better at understanding what I want. I gave it my mandelbrot.ts code, which had a render method that rendered
the mandelbrot fractal on a canvas. First I asked it to help me render the fractal in chunks, rather than the whole
canvas at once. This provides more immediate visual feedback, and allows for user interaction during the rendering
process. It did a pretty good job of doing this, although I had to tweak a few very small things to make it work.

I then asked it to help me move the computation to web workers. It got me about 98% there, although it did omit a
crucial part of the solution: when the main thread received completed chunks from the workers, it just discarded them.
