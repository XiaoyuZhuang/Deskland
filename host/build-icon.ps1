# Original Sylvaframe artwork. Coordinates use a 256 × 256 canvas.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-Mark([int]$Size) {
    $bitmap = [Drawing.Bitmap]::new($Size, $Size, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $canvas = [Drawing.Graphics]::FromImage($bitmap)
    $tile = [Drawing.Drawing2D.GraphicsPath]::new()
    $river = [Drawing.Drawing2D.GraphicsPath]::new()
    $brushes = [Collections.Generic.List[Drawing.Brush]]::new()
    try {
        $canvas.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $canvas.ScaleTransform($Size / 256.0, $Size / 256.0)
        $tile.AddArc(12, 12, 100, 100, 180, 90)
        $tile.AddArc(144, 12, 100, 100, 270, 90)
        $tile.AddArc(144, 144, 100, 100, 0, 90)
        $tile.AddArc(12, 144, 100, 100, 90, 90)
        $tile.CloseFigure()
        $ground = [Drawing.Drawing2D.LinearGradientBrush]::new(
            [Drawing.Rectangle]::new(12, 12, 232, 232),
            [Drawing.ColorTranslator]::FromHtml('#2B5446'),
            [Drawing.ColorTranslator]::FromHtml('#0D2827'), 65)
        $brushes.Add($ground)
        $canvas.FillPath($ground, $tile)

        $sun = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#F4CD83'))
        $brushes.Add($sun)
        $canvas.FillEllipse($sun, 162, 53, 37, 37)

        $pine = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#BDE3A7'))
        $brushes.Add($pine)
        $points = [Drawing.Point[]]@(
            [Drawing.Point]::new(96, 48), [Drawing.Point]::new(126, 94),
            [Drawing.Point]::new(113, 94), [Drawing.Point]::new(140, 135),
            [Drawing.Point]::new(115, 135), [Drawing.Point]::new(143, 170),
            [Drawing.Point]::new(105, 170), [Drawing.Point]::new(105, 189),
            [Drawing.Point]::new(87, 189), [Drawing.Point]::new(87, 170),
            [Drawing.Point]::new(49, 170), [Drawing.Point]::new(77, 135),
            [Drawing.Point]::new(52, 135), [Drawing.Point]::new(79, 94),
            [Drawing.Point]::new(66, 94))
        $canvas.FillPolygon($pine, $points)

        $water = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#68C6BC'))
        $brushes.Add($water)
        $river.AddBezier(205, 103, 186, 115, 159, 128, 162, 143)
        $river.AddBezier(162, 143, 165, 155, 188, 153, 188, 167)
        $river.AddBezier(188, 167, 189, 191, 139, 205, 70, 212)
        $river.AddBezier(70, 212, 129, 215, 218, 199, 214, 166)
        $river.AddBezier(214, 166, 212, 149, 181, 143, 181, 136)
        $river.AddBezier(181, 136, 179, 129, 195, 118, 205, 103)
        $river.CloseFigure()
        $canvas.FillPath($water, $river)
    }
    finally {
        foreach ($brush in $brushes) { $brush.Dispose() }
        $river.Dispose()
        $tile.Dispose()
        $canvas.Dispose()
    }
    return $bitmap
}

# Older icon readers expect small, bottom-up BGRA bitmaps with an AND mask.
function Get-IconBitmap([Drawing.Bitmap]$Bitmap) {
    $size = $Bitmap.Width
    $maskStride = [int]([Math]::Ceiling($size / 32.0) * 4)
    $mask = [byte[]]::new($maskStride * $size)
    $stream = [IO.MemoryStream]::new()
    $writer = [IO.BinaryWriter]::new($stream)
    try {
        $writer.Write([uint32]40)
        $writer.Write([int]$size)
        $writer.Write([int]($size * 2))
        $writer.Write([uint16]1)
        $writer.Write([uint16]32)
        $writer.Write([uint32]0)
        $writer.Write([uint32]($size * $size * 4))
        for ($field = 0; $field -lt 4; $field++) { $writer.Write([uint32]0) }
        for ($y = $size - 1; $y -ge 0; $y--) {
            for ($x = 0; $x -lt $size; $x++) {
                $color = $Bitmap.GetPixel($x, $y)
                $writer.Write($color.B)
                $writer.Write($color.G)
                $writer.Write($color.R)
                $writer.Write($color.A)
                if ($color.A -eq 0) {
                    $index = ($size - 1 - $y) * $maskStride + ($x -shr 3)
                    $mask[$index] = $mask[$index] -bor (128 -shr ($x -band 7))
                }
            }
        }
        $writer.Write($mask)
        return ,$stream.ToArray()
    }
    finally { $writer.Dispose() }
}

$sizes = @(16, 20, 24, 32, 40, 48, 64, 128, 256)
$preview = Join-Path $PSScriptRoot '..\prototype\assets\sylvaframe.png'
$frames = @(foreach ($size in $sizes) {
    $bitmap = New-Mark $size
    try {
        if ($size -le 64) { ,(Get-IconBitmap $bitmap) }
        else {
            $png = [IO.MemoryStream]::new()
            try {
                $bitmap.Save($png, [Drawing.Imaging.ImageFormat]::Png)
                $data = $png.ToArray()
                if ($size -eq 128) { [IO.File]::WriteAllBytes($preview, $data) }
                ,$data
            }
            finally { $png.Dispose() }
        }
    }
    finally { $bitmap.Dispose() }
})

$icon = [IO.File]::Create((Join-Path $PSScriptRoot 'Sylvaframe.ico'))
$writer = [IO.BinaryWriter]::new($icon)
try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$sizes.Count)
    $offset = 6 + 16 * $sizes.Count
    for ($index = 0; $index -lt $sizes.Count; $index++) {
        $dimension = [byte]($sizes[$index] % 256)
        $writer.Write($dimension)
        $writer.Write($dimension)
        $writer.Write([uint16]0)
        $writer.Write([uint16]1)
        $writer.Write([uint16]32)
        $writer.Write([uint32]$frames[$index].Length)
        $writer.Write([uint32]$offset)
        $offset += $frames[$index].Length
    }
    foreach ($frame in $frames) { $writer.Write([byte[]]$frame) }
}
finally { $writer.Dispose() }
