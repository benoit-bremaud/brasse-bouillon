import { colors, radius, spacing, typography } from "@/core/theme";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { BatchStep } from "@/features/batches/domain/batch.types";
import React from "react";

type Props = {
  steps: BatchStep[];
};

export const MIN_TIMELINE_STEP_WIDTH = 84;

type TimelineLayout = {
  timelineWidth: number;
  stepWidth: number;
  trackWidth: number;
};

export function getProgressPercent(sortedSteps: BatchStep[]): number {
  if (sortedSteps.length === 0) {
    return 0;
  }

  if (sortedSteps.length === 1) {
    return sortedSteps[0].status === "completed" ? 100 : 0;
  }

  const currentIndex = sortedSteps.findIndex(
    (step) => step.status === "in_progress",
  );
  if (currentIndex >= 0) {
    return (currentIndex / (sortedSteps.length - 1)) * 100;
  }

  let lastCompletedIndex = -1;
  for (let i = sortedSteps.length - 1; i >= 0; i -= 1) {
    if (sortedSteps[i].status === "completed") {
      lastCompletedIndex = i;
      break;
    }
  }

  if (lastCompletedIndex >= 0) {
    return (lastCompletedIndex / (sortedSteps.length - 1)) * 100;
  }

  return 0;
}

export function getTimelineLayout(
  stepCount: number,
  availableWidth: number,
): TimelineLayout {
  if (stepCount <= 0) {
    return { timelineWidth: 0, stepWidth: 0, trackWidth: 0 };
  }

  const usableViewportWidth = Math.max(0, availableWidth);
  const timelineWidth = Math.max(
    usableViewportWidth,
    stepCount * MIN_TIMELINE_STEP_WIDTH,
  );
  const stepWidth = timelineWidth / stepCount;
  const trackWidth = stepCount > 1 ? timelineWidth - stepWidth : 0;

  return {
    timelineWidth,
    stepWidth,
    trackWidth,
  };
}

export function BatchTimeline({ steps }: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = React.useState(0);

  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const clampedProgressPercent = Math.min(
    100,
    Math.max(0, getProgressPercent(sortedSteps)),
  );

  if (sortedSteps.length === 0) {
    return null;
  }

  const layoutWidth = containerWidth > 0 ? containerWidth : viewportWidth;
  const { timelineWidth, stepWidth, trackWidth } = getTimelineLayout(
    sortedSteps.length,
    layoutWidth,
  );
  const isSingleStep = sortedSteps.length === 1;
  const trackOffset = stepWidth / 2;
  const filledWidth = (trackWidth * clampedProgressPercent) / 100;

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progression du brassin</Text>

      <View onLayout={handleLayout} style={styles.layoutMeasure}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.timelineContent, { width: timelineWidth }]}>
            <View style={styles.trackContainer}>
              {!isSingleStep ? (
                <>
                  <View
                    style={[
                      styles.track,
                      { left: trackOffset, width: trackWidth },
                    ]}
                  />
                  <View
                    style={[
                      styles.trackFilled,
                      { left: trackOffset, width: filledWidth },
                    ]}
                  />
                </>
              ) : null}

              <View
                style={[
                  styles.markersRow,
                  isSingleStep && styles.markersRowSingle,
                ]}
              >
                {sortedSteps.map((step) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "in_progress";

                  return (
                    <View
                      key={`${step.batchId}-${step.stepOrder}`}
                      style={[styles.markerWrap, { width: stepWidth }]}
                    >
                      <View
                        style={[
                          styles.marker,
                          isDone && styles.markerDone,
                          isCurrent && styles.markerCurrent,
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            <View
              style={[styles.labelsRow, isSingleStep && styles.labelsRowSingle]}
            >
              {sortedSteps.map((step) => (
                <View
                  key={`${step.batchId}-${step.stepOrder}-label-wrap`}
                  style={[styles.labelWrap, { width: stepWidth }]}
                >
                  <Text
                    key={`${step.batchId}-${step.stepOrder}-label`}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={styles.label}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  title: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  trackContainer: {
    height: 20,
    justifyContent: "center",
  },
  scrollContent: {
    minWidth: "100%",
  },
  layoutMeasure: {
    width: "100%",
  },
  timelineContent: {
    alignSelf: "center",
  },
  track: {
    position: "absolute",
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.border,
  },
  trackFilled: {
    position: "absolute",
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary,
  },
  markersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  markersRowSingle: {
    justifyContent: "center",
  },
  markerWrap: {
    alignItems: "center",
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral.muted,
    backgroundColor: colors.neutral.white,
  },
  markerDone: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  markerCurrent: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  labelsRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
  },
  labelsRowSingle: {
    justifyContent: "center",
  },
  labelWrap: {
    paddingHorizontal: spacing.xxs,
    alignItems: "center",
  },
  label: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
});
