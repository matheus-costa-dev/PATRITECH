"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";

type QrScannerProps = {
  onClose: () => void;
};

export default function QrScanner({ onClose }: QrScannerProps) {
  const router = useRouter();

  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const qrRegionId = "qr-reader";

    if (!qrCodeRef.current) {
      qrCodeRef.current = new Html5Qrcode(qrRegionId);
    }

    const startScanner = async () => {
      try {
        await qrCodeRef.current?.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (!isScanningRef.current) return;

            isScanningRef.current = false;

            try {
              await qrCodeRef.current?.stop();
            } catch {
              // evita erro se o stop for chamado mais de uma vez
            }

            onClose();

            if (decodedText.startsWith("http")) {
              window.location.href = decodedText;
            } else {
              router.push(`/ativos/${decodedText}`);
            }
          },
          (errorMessage) => {
            console.error(errorMessage)
            // Callback obrigatório no TypeScript
            // Erros de leitura são normais
            // console.debug(errorMessage);
          }
        );

        isScanningRef.current = true;
      } catch (err) {
        console.error("Erro ao iniciar o scanner:", err);
      }
    };

    startScanner();

    return () => {
      if (qrCodeRef.current && isScanningRef.current) {
        qrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            isScanningRef.current = false;
          });
      }
    };
  }, [router, onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl shadow-xl">
        <div id="qr-reader" className="w-75" />

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
