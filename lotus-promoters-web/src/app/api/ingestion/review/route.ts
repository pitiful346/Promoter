import { NextRequest, NextResponse } from "next/server";
import { firestoreIngestionRepository } from "@/infrastructure/firebase/FirestoreIngestionRepository";
import { ImportedEventStatus } from "@/core/domain/ingestion";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ImportedEventStatus | null;
    const sourceId = searchParams.get("source_id") || undefined;
    const city = searchParams.get("city") || undefined;

    const events = await firestoreIngestionRepository.getImportedEvents({
      status: status || undefined,
      source_id: sourceId,
      city,
    });

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error: unknown) {
    console.error("API /api/ingestion/review GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao listar fila de revisão",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, eventId, targetOrgId, userId, reason, duplicateOfId } = body;

    if (!eventId || !action) {
      return NextResponse.json(
        { success: false, error: "eventId e action são obrigatórios" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      if (!targetOrgId || !userId) {
        return NextResponse.json(
          { success: false, error: "targetOrgId e userId são obrigatórios para aprovar" },
          { status: 400 }
        );
      }
      const createdEvent = await firestoreIngestionRepository.approveImportedEvent(
        eventId,
        targetOrgId,
        userId
      );
      return NextResponse.json({ success: true, action: "approve", event: createdEvent });
    }

    if (action === "reject") {
      await firestoreIngestionRepository.rejectImportedEvent(
        eventId,
        reason || "Rejeitado na revisão manual",
        userId || "admin"
      );
      return NextResponse.json({ success: true, action: "reject", eventId });
    }

    if (action === "mark_duplicate") {
      if (!duplicateOfId) {
        return NextResponse.json(
          { success: false, error: "duplicateOfId é obrigatório para marcar duplicado" },
          { status: 400 }
        );
      }
      await firestoreIngestionRepository.markAsDuplicate(eventId, duplicateOfId);
      return NextResponse.json({ success: true, action: "mark_duplicate", eventId, duplicateOfId });
    }

    return NextResponse.json(
      { success: false, error: `Ação desconhecida: ${action}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("API /api/ingestion/review POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao processar ação na fila de revisão",
      },
      { status: 500 }
    );
  }
}
