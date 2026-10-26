import type { Location } from './locations'

// Original personal expressions, rather than attributed quotations or city facts.
export function locationStatements(place: Location): string[] {
  const n = place.name
  return [
    `${n} is written into my beginning.`, `I carry ${n} wherever I go.`, `My roots speak the language of ${n}.`, `Made of memories from ${n}.`, `${n}: a place, a feeling, a part of me.`, `Every road starts somewhere. Mine starts in ${n}.`, `A little ${n} in everything I do.`, `${n} taught me to find my own way.`, `My story has a ${n} chapter.`, `Home is the way I remember ${n}.`, `From ${n}, with possibility.`, `The streets of ${n} live in my memory.`, `My heart keeps a map of ${n}.`, `${n} belongs to my story.`, `New horizons, the same ${n} soul.`, `I wear my love for ${n}.`, `${n} is more than a point on my map.`, `Somewhere in me, it is always ${n}.`, `A signature shaped by ${n}.`, `No distance erases ${n}.`,
  ]
}
export function mixedStatements(from: Location, to: Location): string[] {
  const a=from.name,b=to.name
  return [
    `Rooted in ${a}. Growing in ${b}.`, `${a} made me. ${b} moves me.`, `From ${a} to ${b}, still becoming.`, `Two places. One story: ${a} / ${b}.`, `My roots are in ${a}; my everyday is in ${b}.`, `A ${a} heart with a ${b} address.`, `Carrying ${a} through the streets of ${b}.`, `${a} behind my steps, ${b} before my eyes.`, `Where ${a} meets ${b}, I find myself.`, `My beginning: ${a}. My now: ${b}.`, `${a} in my memory. ${b} in my moment.`, `One signature, between ${a} and ${b}.`, `Born of one chapter in ${a}, writing another in ${b}.`, `The distance between ${a} and ${b} is part of me.`, `A little ${a}, a little ${b}, entirely me.`, `Home stretches from ${a} to ${b}.`, `The journey is ${a} to ${b}. The story is mine.`, `${a} gave me roots. ${b} gives me room.`, `I bring my ${a} story into my ${b} life.`, `Both ${a} and ${b} belong on my map.`,
  ]
}
