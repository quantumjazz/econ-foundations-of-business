--[[
Lecture helpers shared by every deck in the course.

1. The lecture path. A deck lists its block questions in the front matter:

     blocks:
       - n: 1
         q: "Кой е предприемачът?"

   `::: {.lecture-path}` / `:::` renders them as a vertical path (the overview
   slide). A divider slide is a single line,

     ## {.divider block="3"}

   which becomes the same path with block 3 highlighted and blocks 1–2 dimmed.
   Dividers are left out of the slide count, so on-screen slide numbers match
   the numbering in the brief.

2. Image credits. `::: {.credits}` / `:::` is replaced by a compact list built
   from the table in CREDITS.md at the project root.
]]

local block_questions = {}   -- n (number) -> question (string)
local block_order = {}       -- list of n, in front-matter order

local function esc(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"):gsub('"', "&quot;"))
end

local function read_blocks(meta)
  if not meta.blocks then return end
  for _, b in ipairs(meta.blocks) do
    local n = tonumber(pandoc.utils.stringify(b.n))
    block_questions[n] = pandoc.utils.stringify(b.q)
    table.insert(block_order, n)
  end
end

local function path_html(current)
  local items = {}
  for _, n in ipairs(block_order) do
    local state = "todo"
    if current then
      if n < current then state = "done" elseif n == current then state = "current" end
    end
    local label = ""
    if state == "done" then
      label = '<span class="visually-hidden"> (минали)</span>'
    elseif state == "current" then
      label = '<span class="path-now">сега</span>'
    end
    table.insert(items, string.format(
      '<li class="path-item %s"%s><span class="path-node" aria-hidden="true">%d</span>'
        .. '<span class="path-q">%s</span>%s</li>',
      state, state == "current" and ' aria-current="step"' or "", n, esc(block_questions[n]), label))
  end
  local cls = current and "lecture-path is-divider" or "lecture-path"
  return pandoc.RawBlock("html",
    '<ol class="' .. cls .. '">' .. table.concat(items, "") .. "</ol>")
end

-- CREDITS.md → compact list for the sources slide -------------------------

local function credits_html()
  local dir = (quarto and quarto.project and quarto.project.directory) or "."
  local fh = io.open(dir .. "/CREDITS.md", "r")
  if not fh then
    return pandoc.RawBlock("html", '<p class="credits-missing">CREDITS.md не е намерен.</p>')
  end
  local doc = pandoc.read(fh:read("*a"), "markdown")
  fh:close()
  local rows = {}
  for _, blk in ipairs(doc.blocks) do
    if blk.t == "Table" then
      for _, body in ipairs(blk.bodies) do
        for _, row in ipairs(body.body) do
          local c = {}
          for i, cell in ipairs(row.cells) do c[i] = pandoc.utils.stringify(cell.contents) end
          -- columns: file | slides | what | author | source | licence
          local parts = {}
          for _, i in ipairs({ 4, 5 }) do
            local v = c[i] or ""
            if v ~= "" and v ~= "—" and v ~= "-" then table.insert(parts, esc(v)) end
          end
          table.insert(rows, string.format(
            '<li><span class="cr-slide">Сл. %s</span> %s — %s. <span class="cr-lic">%s</span></li>',
            esc(c[2] or ""), esc(c[3] or ""), table.concat(parts, ". "), esc(c[6] or "")))
        end
      end
      break
    end
  end
  return pandoc.RawBlock("html", '<ul class="credits-list">' .. table.concat(rows, "") .. "</ul>")
end

-- Main pass ---------------------------------------------------------------

function Pandoc(doc)
  read_blocks(doc.meta)
  local out = pandoc.List()
  for _, blk in ipairs(doc.blocks) do
    if blk.t == "Header" and blk.level == 2 then
      if blk.classes:includes("divider") then
        local n = tonumber(blk.attributes["block"])
        blk.content = pandoc.Inlines(string.format("%d · %s", n, block_questions[n] or ""))
        -- Pandoc has already given the empty header an id like "section-3".
        blk.identifier = "blok-" .. n
        blk.attributes["visibility"] = "uncounted"
        blk.attributes["block"] = nil
        out:insert(blk)
        out:insert(path_html(n))
      else
        out:insert(blk)
      end
    elseif blk.t == "Div" and blk.classes:includes("lecture-path") then
      out:insert(path_html(nil))
    elseif blk.t == "Div" and blk.classes:includes("credits") then
      out:insert(credits_html())
    else
      out:insert(blk)
    end
  end
  doc.blocks = out
  return doc
end
