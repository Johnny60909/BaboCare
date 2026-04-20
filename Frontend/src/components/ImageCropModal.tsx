import { Modal, Button, Group, Stack, Slider, Text } from "@mantine/core";
import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import type { Area, Point } from "react-easy-crop";

interface ImageCropModalProps {
  opened: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio?: number;
}

export default function ImageCropModal({
  opened,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropAreaChange = (_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setIsProcessing(true);
    try {
      const image = new Image();
      image.src = imageSrc;

      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        image,
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
          onClose();
        }
        setIsProcessing(false);
      }, "image/jpeg");
    } catch (error) {
      console.error("裁剪圖片失敗:", error);
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete, onClose]);

  return (
    <Modal opened={opened} onClose={onClose} title="裁剪頭像" size="lg">
      <Stack gap="lg">
        <div style={{ position: "relative", width: "100%", height: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropAreaChange={onCropAreaChange}
            onZoomChange={setZoom}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            縮放
          </Text>
          <Slider
            value={zoom}
            onChangeEnd={setZoom}
            min={1}
            max={3}
            step={0.1}
            marks={[
              { value: 1, label: "1x" },
              { value: 2, label: "2x" },
              { value: 3, label: "3x" },
            ]}
          />
        </div>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={!croppedAreaPixels}
          >
            確定裁剪
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
