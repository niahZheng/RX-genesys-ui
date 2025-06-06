

import {NodeSDK} from "@opentelemetry/sdk-node";
import {ConsoleSpanExporter} from "@opentelemetry/sdk-trace-node";
import {ConsoleMetricExporter, PeriodicExportingMetricReader} from "@opentelemetry/sdk-metrics";
import {getNodeAutoInstrumentations} from "@opentelemetry/auto-instrumentations-node";

export default function setupTelemetry() {
  const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}
