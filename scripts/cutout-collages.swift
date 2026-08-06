#!/usr/bin/env swift

import AppKit
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct Options {
    var input = "public/images/collage"
    var output = "public/images/collage-cutout"
    var tolerance = 42.0
    var feather = 14.0
    var overwrite = false
    var dryRun = false
}

func usage() -> Never {
    print("""
    Genera PNG RGBA scontornati dagli originali JPG/PNG/WebP.

    Uso:
      swift scripts/cutout-collages.swift [opzioni]

    Opzioni:
      --input <cartella>       Sorgenti (default: public/images/collage)
      --output <cartella>      Destinazione (default: public/images/collage-cutout)
      --tolerance <0...255>    Distanza massima dallo sfondo (default: 42)
      --feather <0...255>      Morbidezza del bordo (default: 14)
      --overwrite              Sovrascrive PNG già esistenti
      --dry-run                Elenca soltanto i file
      --help                   Mostra questo aiuto

    Lo sfondo viene stimato dalla mediana dei pixel sul perimetro. Un flood fill
    parte da tutti i bordi e rende trasparenti soltanto i pixel di sfondo collegati
    all'esterno, preservando le aree chiare o scure chiuse dentro il collage.
    """)
    exit(0)
}

func parseOptions() throws -> Options {
    var options = Options()
    var index = 1
    let args = CommandLine.arguments

    func value(after flag: String) throws -> String {
        guard index + 1 < args.count else {
            throw NSError(domain: "Cutout", code: 2, userInfo: [NSLocalizedDescriptionKey: "Manca il valore per \(flag)"])
        }
        index += 1
        return args[index]
    }

    while index < args.count {
        switch args[index] {
        case "--input": options.input = try value(after: "--input")
        case "--output": options.output = try value(after: "--output")
        case "--tolerance":
            guard let number = Double(try value(after: "--tolerance")), (0...255).contains(number) else {
                throw NSError(domain: "Cutout", code: 2, userInfo: [NSLocalizedDescriptionKey: "--tolerance deve essere tra 0 e 255"])
            }
            options.tolerance = number
        case "--feather":
            guard let number = Double(try value(after: "--feather")), (0...255).contains(number) else {
                throw NSError(domain: "Cutout", code: 2, userInfo: [NSLocalizedDescriptionKey: "--feather deve essere tra 0 e 255"])
            }
            options.feather = number
        case "--overwrite": options.overwrite = true
        case "--dry-run": options.dryRun = true
        case "--help", "-h": usage()
        default:
            throw NSError(domain: "Cutout", code: 2, userInfo: [NSLocalizedDescriptionKey: "Opzione sconosciuta: \(args[index])"])
        }
        index += 1
    }

    return options
}

func median(_ values: [UInt8]) -> UInt8 {
    let sorted = values.sorted()
    return sorted[sorted.count / 2]
}

func colorDistance(_ r: UInt8, _ g: UInt8, _ b: UInt8, background: (UInt8, UInt8, UInt8)) -> Double {
    let dr = Double(Int(r) - Int(background.0))
    let dg = Double(Int(g) - Int(background.1))
    let db = Double(Int(b) - Int(background.2))
    return sqrt((dr * dr + dg * dg + db * db) / 3.0)
}

func loadRGBA(from url: URL) throws -> (pixels: [UInt8], width: Int, height: Int) {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        throw NSError(domain: "Cutout", code: 3, userInfo: [NSLocalizedDescriptionKey: "Impossibile leggere \(url.lastPathComponent)"])
    }

    let width = image.width
    let height = image.height
    let bytesPerRow = width * 4
    var pixels = [UInt8](repeating: 0, count: height * bytesPerRow)
    let colorSpace = CGColorSpaceCreateDeviceRGB()

    guard let context = CGContext(
        data: &pixels,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
    ) else {
        throw NSError(domain: "Cutout", code: 4, userInfo: [NSLocalizedDescriptionKey: "Impossibile creare il canvas RGBA"])
    }

    context.interpolationQuality = .high
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    return (pixels, width, height)
}

func estimateBackground(_ pixels: [UInt8], width: Int, height: Int) -> (UInt8, UInt8, UInt8) {
    var reds: [UInt8] = []
    var greens: [UInt8] = []
    var blues: [UInt8] = []
    let stride = max(1, min(width, height) / 180)

    func sample(_ x: Int, _ y: Int) {
        let offset = (y * width + x) * 4
        reds.append(pixels[offset])
        greens.append(pixels[offset + 1])
        blues.append(pixels[offset + 2])
    }

    for x in Swift.stride(from: 0, to: width, by: stride) {
        sample(x, 0)
        if height > 1 { sample(x, height - 1) }
    }
    for y in Swift.stride(from: 1, to: max(1, height - 1), by: stride) {
        sample(0, y)
        if width > 1 { sample(width - 1, y) }
    }

    return (median(reds), median(greens), median(blues))
}

func removeConnectedBackground(
    pixels: inout [UInt8],
    width: Int,
    height: Int,
    tolerance: Double,
    feather: Double
) -> (background: (UInt8, UInt8, UInt8), transparent: Int) {
    let background = estimateBackground(pixels, width: width, height: height)
    let count = width * height
    var visited = [Bool](repeating: false, count: count)
    var queue = [Int]()
    queue.reserveCapacity(count / 3)
    var head = 0

    func eligible(_ index: Int) -> Bool {
        let offset = index * 4
        return colorDistance(pixels[offset], pixels[offset + 1], pixels[offset + 2], background: background) <= tolerance
    }

    func enqueue(_ index: Int) {
        guard !visited[index], eligible(index) else { return }
        visited[index] = true
        queue.append(index)
    }

    for x in 0..<width {
        enqueue(x)
        if height > 1 { enqueue((height - 1) * width + x) }
    }
    if height > 2 {
        for y in 1..<(height - 1) {
            enqueue(y * width)
            if width > 1 { enqueue(y * width + width - 1) }
        }
    }

    while head < queue.count {
        let index = queue[head]
        head += 1
        let x = index % width
        let y = index / width

        if x > 0 { enqueue(index - 1) }
        if x + 1 < width { enqueue(index + 1) }
        if y > 0 { enqueue(index - width) }
        if y + 1 < height { enqueue(index + width) }
    }

    var transparent = 0
    let fadeStart = max(0, tolerance - feather)
    for index in queue {
        let offset = index * 4
        let distance = colorDistance(pixels[offset], pixels[offset + 1], pixels[offset + 2], background: background)
        let alpha: UInt8
        if feather <= 0 || distance <= fadeStart {
            alpha = 0
        } else {
            let fraction = min(1, max(0, (distance - fadeStart) / feather))
            alpha = UInt8((fraction * 255.0).rounded())
        }
        pixels[offset + 3] = alpha
        if alpha == 0 { transparent += 1 }
    }

    return (background, transparent)
}

func writePNG(_ pixels: inout [UInt8], width: Int, height: Int, to url: URL) throws {
    let bytesPerRow = width * 4
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(
        data: &pixels,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
    ), let image = context.makeImage() else {
        throw NSError(domain: "Cutout", code: 5, userInfo: [NSLocalizedDescriptionKey: "Impossibile creare l'immagine PNG"])
    }

    guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw NSError(domain: "Cutout", code: 6, userInfo: [NSLocalizedDescriptionKey: "Impossibile creare \(url.path)"])
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else {
        throw NSError(domain: "Cutout", code: 7, userInfo: [NSLocalizedDescriptionKey: "Scrittura fallita: \(url.path)"])
    }
}

func main() throws {
    let options = try parseOptions()
    let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
    let inputURL = URL(fileURLWithPath: options.input, relativeTo: root).standardizedFileURL
    let outputURL = URL(fileURLWithPath: options.output, relativeTo: root).standardizedFileURL
    let supported = Set(["jpg", "jpeg", "png", "webp", "tif", "tiff"])

    let files = try FileManager.default.contentsOfDirectory(
        at: inputURL,
        includingPropertiesForKeys: [.isRegularFileKey],
        options: [.skipsHiddenFiles]
    ).filter { supported.contains($0.pathExtension.lowercased()) }
     .sorted { $0.lastPathComponent.localizedStandardCompare($1.lastPathComponent) == .orderedAscending }

    guard !files.isEmpty else {
        throw NSError(domain: "Cutout", code: 8, userInfo: [NSLocalizedDescriptionKey: "Nessuna immagine trovata in \(inputURL.path)"])
    }

    print("Sorgenti: \(files.count) — \(inputURL.path)")
    print("Destinazione: \(outputURL.path)")
    print("Tolleranza: \(options.tolerance), feather: \(options.feather)\n")

    if options.dryRun {
        files.forEach { print("• \($0.lastPathComponent)") }
        return
    }

    try FileManager.default.createDirectory(at: outputURL, withIntermediateDirectories: true)
    var written = 0
    var skipped = 0

    for source in files {
        let destination = outputURL.appendingPathComponent(source.deletingPathExtension().lastPathComponent + ".png")
        if FileManager.default.fileExists(atPath: destination.path), !options.overwrite {
            print("↷ già esiste: \(destination.lastPathComponent)")
            skipped += 1
            continue
        }

        var (pixels, width, height) = try loadRGBA(from: source)
        let result = removeConnectedBackground(
            pixels: &pixels,
            width: width,
            height: height,
            tolerance: options.tolerance,
            feather: options.feather
        )
        try writePNG(&pixels, width: width, height: height, to: destination)

        let percent = Double(result.transparent) / Double(width * height) * 100.0
        print(String(format: "✓ %@ — sfondo RGB(%d,%d,%d), trasparente %.1f%%", destination.lastPathComponent, result.background.0, result.background.1, result.background.2, percent))
        written += 1
    }

    print("\nCompletato: \(written) PNG creati, \(skipped) saltati.")
}

do {
    try main()
} catch {
    fputs("Errore: \(error.localizedDescription)\n", stderr)
    exit(1)
}
