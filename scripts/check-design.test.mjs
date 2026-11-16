import assert from "node:assert/strict";
import { test } from "node:test";
import { hasStyleAttribute, photoOf, placeholdersIn, problems, repeatedPhotos } from "./check-design.mjs";

const img = (src) => `<img src="${src}" alt="A roof">`;

test("a photo is named by the part of its built file name before the variant", () => {
  assert.equal(photoOf("/_astro/4.ByNI1o3A_xXJk0.avif"), "4.ByNI1o3A");
  assert.equal(photoOf("/_astro/4.ByNI1o3A_Z2nkQMn.avif"), "4.ByNI1o3A");
});

test("the logo and other files outside /_astro/ are not photos", () => {
  assert.equal(photoOf("/logo.svg"), undefined);
  assert.equal(photoOf(undefined), undefined);
});

test("two sizes of the same photo on one page are reported", () => {
  assert.deepEqual(repeatedPhotos(img("/_astro/1.Abc_a.avif") + img("/_astro/1.Abc_b.avif")), ["1.Abc"]);
});

test("different photos on one page are fine", () => {
  assert.deepEqual(repeatedPhotos(img("/_astro/1.Abc_a.avif") + img("/_astro/2.Def_a.avif") + img("/logo.svg") + img("/logo.svg")), []);
});

test("placeholder words in the visible text are found", () => {
  assert.deepEqual(placeholdersIn("<p>Lorem ipsum dolor</p>"), ["Lorem ipsum"]);
  assert.deepEqual(placeholdersIn("<p>Opening hours: TBD</p>"), ["TBD"]);
  assert.deepEqual(placeholdersIn("<p><strong>Vzorčno besedilo.</strong></p>"), ["Vzorčno besedilo"]);
});

test("placeholder words in an alternative text are found", () => {
  assert.deepEqual(placeholdersIn('<img src="/x.avif" alt="TODO">'), ["TODO"]);
});

test("placeholder words in a script or a stylesheet are not text", () => {
  assert.deepEqual(placeholdersIn("<script>// TODO</script><style>/* TBD */</style><p>Roofs</p>"), []);
});

test("ordinary text has no placeholders", () => {
  assert.deepEqual(placeholdersIn("<p>Izdelava in obnova vseh vrst fasad. A todo list in lower case is fine.</p>"), []);
});

test("a style attribute is found, a class is not", () => {
  assert.equal(hasStyleAttribute('<div style="color: red">x</div>'), true);
  assert.equal(hasStyleAttribute('<div class="styled">x</div>'), false);
  assert.equal(hasStyleAttribute("<style>p { color: red }</style>"), false);
});

test("every problem of a page gets a message naming the page and the fix", () => {
  const html = img("/_astro/1.Abc_a.avif") + img("/_astro/1.Abc_b.avif") + '<p style="x">Lorem ipsum</p>';
  const found = problems("/sl.html", html);
  assert.equal(found.length, 3);
  assert.ok(found.every((message) => message.startsWith("design: /sl.html ")));
});

test("a clean page has no problems", () => {
  assert.deepEqual(problems("/sl.html", img("/_astro/1.Abc_a.avif") + "<p>Strehe</p>"), []);
});
