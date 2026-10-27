import { NextRequest, NextResponse } from "next/server";
import { posterExtractionService } from "@/infrastructure/ai/PosterExtractionService";
import { Venue } from "@/core/domain/venue";

// Simple in-memory rate limiter (15 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return false;
  }

  if (entry.count >= 15) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown_client";
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Demasiados pedidos de análise de cartaz. Por favor aguarda 1 minuto.",
        },
        { status: 429 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let imageBase64 = "";
    let mimeType = "image/jpeg";
    let venues: Venue[] = [];

    // 2. Handle Multipart Form Data
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const venuesRaw = formData.get("venues") as string | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "Nenhum ficheiro de imagem foi fornecido." },
          { status: 400 }
        );
      }

      // Check MIME type
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Formato de imagem inválido. Suporta apenas JPG, PNG ou WebP." },
          { status: 400 }
        );
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "O tamanho do cartaz não pode exceder 10MB." },
          { status: 400 }
        );
      }

      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString("base64");

      if (venuesRaw) {
        try {
          venues = JSON.parse(venuesRaw);
        } catch {}
      }
    }
    // 3. Handle JSON with Base64 payload
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.imageBase64) {
        return NextResponse.json(
          { success: false, error: "Dados de imagem em base64 não fornecidos." },
          { status: 400 }
        );
      }
      imageBase64 = body.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      mimeType = body.mimeType || "image/jpeg";
      venues = body.venues || [];
    } else {
      return NextResponse.json(
        { success: false, error: "Content-Type não suportado. Use multipart/form-data ou application/json." },
        { status: 400 }
      );
    }

    // 4. Execute AI Extraction Service
    const result = await posterExtractionService.extractFromPoster(
      imageBase64,
      mimeType,
      venues
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("API /api/ai/extract-poster error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno no servidor ao processar cartaz.",
      },
      { status: 500 }
    );
  }
}
