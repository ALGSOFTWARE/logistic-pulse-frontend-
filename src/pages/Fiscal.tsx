import React, { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { useOrders } from "@/hooks/useOrders";
import { useDebounce } from "use-debounce";
import { matchSorter } from "match-sorter";
import {
  Loader2,
  FileSpreadsheet,
  FileText,
  ArrowRightCircle,
  Download,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  RefreshCcw,
  Truck,
  Search,
} from "lucide-react";

interface OrderSuggestion {
  value: string;
  label: string;
}

interface AddressField {
  xLgr: string;
  nro: string;
  xCpl: string;
  xBairro: string;
  cMun: string;
  xMun: string;
  UF: string;
  CEP: string;
  cPais: string;
  xPais: string;
  fone: string;
}

interface NFeFormState {
  ide: {
    cUF: string;
    cNF: string;
    natOp: string;
    mod: string;
    serie: string;
    nNF: string;
    dhEmi: string;
    dhSaiEnt: string;
    tpNF: string;
    idDest: string;
    cMunFG: string;
    tpImp: string;
    tpEmis: string;
    tpAmb: string;
    finNFe: string;
    indFinal: string;
    indPres: string;
    indIntermed: string;
    procEmi: string;
    verProc: string;
    NFref: string;
  };
  emit: {
    CNPJ: string;
    xNome: string;
    xFant: string;
    IE: string;
    CRT: string;
    enderEmit: AddressField;
  };
  dest: {
    CNPJ: string;
    xNome: string;
    indIEDest: string;
    IE: string;
    email: string;
    enderDest: AddressField;
  };
  item: {
    prod: {
      cProd: string;
      cEAN: string;
      xProd: string;
      NCM: string;
      CFOP: string;
      uCom: string;
      qCom: string;
      vUnCom: string;
      vProd: string;
      cEANTrib: string;
      uTrib: string;
      qTrib: string;
      vUnTrib: string;
      indTot: string;
      vFrete: string;
      vSeg: string;
      vDesc: string;
      vOutro: string;
    };
    imposto: {
      orig: string;
      CST: string;
      modBC: string;
      vBC: string;
      pICMS: string;
      vICMS: string;
      pPIS: string;
      vPIS: string;
      pCOFINS: string;
      vCOFINS: string;
      vTotTrib: string;
    };
  };
  transp: {
    modFrete: string;
  };
  pag: {
    indPag: string;
    tPag: string;
    vPag: string;
    tpIntegra: string;
    cardCNPJ: string;
    tBand: string;
    cAut: string;
    vTroco: string;
  };
  infAdic: {
    infAdFisco: string;
    infCpl: string;
  };
  totalOverrides: {
    vPIS: string;
    vCOFINS: string;
    vTotTrib: string;
    vICMS: string;
  };
}

const defaultAddress: AddressField = {
  xLgr: "Rua do Progresso",
  nro: "100",
  xCpl: "Sala 501",
  xBairro: "Centro",
  cMun: "3550308",
  xMun: "São Paulo",
  UF: "SP",
  CEP: "01001000",
  cPais: "1058",
  xPais: "BRASIL",
  fone: "1133334444",
};

const defaultDestAddress: AddressField = {
  xLgr: "Avenida das Nações Unidas",
  nro: "2000",
  xCpl: "",
  xBairro: "Pinheiros",
  cMun: "3550308",
  xMun: "São Paulo",
  UF: "SP",
  CEP: "05415002",
  cPais: "1058",
  xPais: "BRASIL",
  fone: "1144445555",
};

const defaultNfeForm: NFeFormState = {
  ide: {
    cUF: "35",
    cNF: "12345678",
    natOp: "VENDA DE MERCADORIA",
    mod: "55",
    serie: "1",
    nNF: "12345",
    dhEmi: "2025-07-10T12:00:00-03:00",
    dhSaiEnt: "2025-07-10T13:00:00-03:00",
    tpNF: "1",
    idDest: "1",
    cMunFG: "3550308",
    tpImp: "1",
    tpEmis: "1",
    tpAmb: "2",
    finNFe: "1",
    indFinal: "1",
    indPres: "1",
    indIntermed: "0",
    procEmi: "0",
    verProc: "1.0.0",
    NFref: "35170100000000000000550010000000011000000011",
  },
  emit: {
    CNPJ: "12345678000199",
    xNome: "Transportadora JaguareTech LTDA",
    xFant: "JaguareTech",
    IE: "123456789012",
    CRT: "3",
    enderEmit: { ...defaultAddress },
  },
  dest: {
    CNPJ: "98765432000155",
    xNome: "Cliente Exemplo LTDA",
    indIEDest: "1",
    IE: "908070605001",
    email: "contato@clienteexemplo.com",
    enderDest: { ...defaultDestAddress },
  },
  item: {
    prod: {
      cProd: "SKU123",
      cEAN: "7891234567890",
      xProd: "Monitor 27\" 4K",
      NCM: "85285200",
      CFOP: "5102",
      uCom: "UN",
      qCom: "2.0000",
      vUnCom: "2500.0000000000",
      vProd: "5000.00",
      cEANTrib: "7891234567890",
      uTrib: "UN",
      qTrib: "2.0000",
      vUnTrib: "2500.0000000000",
      indTot: "1",
      vFrete: "0.00",
      vSeg: "0.00",
      vDesc: "0.00",
      vOutro: "0.00",
    },
    imposto: {
      orig: "0",
      CST: "00",
      modBC: "3",
      vBC: "5000.00",
      pICMS: "18.00",
      vICMS: "900.00",
      pPIS: "1.65",
      vPIS: "82.50",
      pCOFINS: "7.60",
      vCOFINS: "380.00",
      vTotTrib: "1362.50",
    },
  },
  transp: {
    modFrete: "0",
  },
  pag: {
    indPag: "0",
    tPag: "01",
    vPag: "5000.00",
    tpIntegra: "1",
    cardCNPJ: "12345678000199",
    tBand: "01",
    cAut: "AUT123",
    vTroco: "0.00",
  },
  infAdic: {
    infAdFisco: "Isento de ICMS art. 14.",
    infCpl: "Documento emitido em ambiente de homologação.",
  },
  totalOverrides: {
    vPIS: "82.50",
    vCOFINS: "380.00",
    vTotTrib: "1362.50",
    vICMS: "900.00",
  },
};

const REQUIRED_ADDRESS_FIELDS: (keyof AddressField)[] = [
  "xLgr",
  "nro",
  "xBairro",
  "cMun",
  "xMun",
  "UF",
  "CEP",
  "cPais",
  "xPais",
];

const LabeledInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, placeholder, type = "text", required }) => (
  <div className="grid gap-1">
    <label className="text-xs font-medium text-muted-foreground">
      {label}
      {required ? " *" : ""}
    </label>
    <Input
      value={value}
      type={type}
      placeholder={placeholder}
      required={required}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const LabeledTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  readOnly?: boolean;
}> = ({ label, value, onChange, rows = 4, readOnly = false }) => (
  <div className="grid gap-1">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    <Textarea
      value={value}
      rows={rows}
      readOnly={readOnly}
      onChange={(event) => {
        if (!readOnly) {
          onChange(event.target.value);
        }
      }}
    />
  </div>
);

const cloneNfeForm = () => JSON.parse(JSON.stringify(defaultNfeForm)) as NFeFormState;

interface CTeFormState {
  ide: {
    cUF: string;
    cCT: string;
    CFOP: string;
    natOp: string;
    mod: string;
    serie: string;
    nCT: string;
    dhEmi: string;
    tpImp: string;
    tpEmis: string;
    tpAmb: string;
    tpCTe: string;
    procEmi: string;
    verProc: string;
    cMunEnv: string;
    xMunEnv: string;
    UFEnv: string;
    modal: string;
    tpServ: string;
    indIEToma: string;
  };
  emit: {
    CNPJ: string;
    IE: string;
    xNome: string;
    xFant: string;
    enderEmit: AddressField;
  };
  rem: {
    CNPJ: string;
    IE: string;
    xNome: string;
    fone: string;
    enderReme: AddressField;
  };
  dest: {
    CNPJ: string;
    IE: string;
    xNome: string;
    fone: string;
    enderDest: AddressField;
  };
  toma: {
    toma: string;
    toma3: {
      CNPJ: string;
      IE: string;
      xNome: string;
      fone: string;
      enderToma: AddressField;
    };
  };
  vPrest: {
    vTPrest: string;
    vRec: string;
    component1Nome: string;
    component1Valor: string;
    component2Nome: string;
    component2Valor: string;
    component3Nome: string;
    component3Valor: string;
  };
  imp: {
    CST: string;
    orig: string;
    vBC: string;
    pICMS: string;
    vICMS: string;
    infAdFisco: string;
  };
  infCarga: {
    vCarga: string;
    proPred: string;
    cUnid: string;
    tpMed: string;
    qCarga: string;
  };
  infModal: {
    versaoModal: string;
    RNTRC: string;
  };
  autXMLCNPJ: string;
  respTec: {
    CNPJ: string;
    xContato: string;
    email: string;
    fone: string;
  };
}

const defaultRemAddress: AddressField = {
  xLgr: "Avenida das Nações Unidas",
  nro: "2000",
  xCpl: "",
  xBairro: "Pinheiros",
  cMun: "3550308",
  xMun: "São Paulo",
  UF: "SP",
  CEP: "05415002",
  cPais: "1058",
  xPais: "BRASIL",
  fone: "1144445555",
};

const defaultDestCteAddress: AddressField = {
  xLgr: "Rodovia BR-040",
  nro: "KM 25",
  xCpl: "",
  xBairro: "Distrito Industrial",
  cMun: "3106200",
  xMun: "Belo Horizonte",
  UF: "MG",
  CEP: "31275000",
  cPais: "1058",
  xPais: "BRASIL",
  fone: "3199999999",
};

const defaultTomaAddress: AddressField = {
  xLgr: "Rua das Docas",
  nro: "500",
  xCpl: "",
  xBairro: "Porto",
  cMun: "3304557",
  xMun: "Rio de Janeiro",
  UF: "RJ",
  CEP: "20010000",
  cPais: "1058",
  xPais: "BRASIL",
  fone: "2133334444",
};

const defaultCteForm: CTeFormState = {
  ide: {
    cUF: "35",
    cCT: "12345678",
    CFOP: "5351",
    natOp: "PREST SERV TRANSPORTE",
    mod: "57",
    serie: "1",
    nCT: "67890",
    dhEmi: "2025-07-10T12:30:00-03:00",
    tpImp: "1",
    tpEmis: "1",
    tpAmb: "2",
    tpCTe: "0",
    procEmi: "0",
    verProc: "1.0.0",
    cMunEnv: "3550308",
    xMunEnv: "São Paulo",
    UFEnv: "SP",
    modal: "01",
    tpServ: "0",
    indIEToma: "1",
  },
  emit: {
    CNPJ: "12345678000199",
    IE: "123456789012",
    xNome: "Transportadora JaguareTech LTDA",
    xFant: "JaguareTech",
    enderEmit: { ...defaultAddress },
  },
  rem: {
    CNPJ: "98765432000155",
    IE: "908070605001",
    xNome: "Remetente Exemplo LTDA",
    fone: "1144445555",
    enderReme: { ...defaultRemAddress },
  },
  dest: {
    CNPJ: "10293847560123",
    IE: "554433221100",
    xNome: "Destinatário Industrial SA",
    fone: "3199999999",
    enderDest: { ...defaultDestCteAddress },
  },
  toma: {
    toma: "4",
    toma3: {
      CNPJ: "74185296000188",
      IE: "112233445566",
      xNome: "Tomador Logística Integrada",
      fone: "2133334444",
      enderToma: { ...defaultTomaAddress },
    },
  },
  vPrest: {
    vTPrest: "6200.00",
    vRec: "6200.00",
    component1Nome: "Frete peso",
    component1Valor: "5000.00",
    component2Nome: "Pedágio",
    component2Valor: "200.00",
    component3Nome: "Seguro",
    component3Valor: "1000.00",
  },
  imp: {
    CST: "00",
    orig: "0",
    vBC: "6200.00",
    pICMS: "12.00",
    vICMS: "744.00",
    infAdFisco: "Tributação normal do serviço de transporte.",
  },
  infCarga: {
    vCarga: "8000.00",
    proPred: "Equipamentos eletrônicos",
    cUnid: "00",
    tpMed: "KG",
    qCarga: "1200.000",
  },
  infModal: {
    versaoModal: "4.00",
    RNTRC: "12345678",
  },
  autXMLCNPJ: "12312312300019",
  respTec: {
    CNPJ: "12345678000199",
    xContato: "Equipe Técnica JaguareTech",
    email: "tech@jaguaretech.com",
    fone: "1133334444",
  },
};

const cloneCteForm = () => JSON.parse(JSON.stringify(defaultCteForm)) as CTeFormState;

const Fiscal: React.FC = () => {
  const { toast } = useToast();
  const { orders } = useOrders();

  const [nfeOrderId, setNfeOrderId] = useState("");
  const [nfeOrderQuery, setNfeOrderQuery] = useState("");
  const [nfeOrderQueryDebounced] = useDebounce(nfeOrderQuery, 150);
  const [nfeForm, setNfeForm] = useState<NFeFormState>(() => cloneNfeForm());
  const [nfeNote, setNfeNote] = useState("NF-e gerada via painel fiscal.");
  const [nfeResult, setNfeResult] = useState<Record<string, any> | null>(null);

  const [cteOrderId, setCteOrderId] = useState("");
  const [cteOrderQuery, setCteOrderQuery] = useState("");
  const [cteOrderQueryDebounced] = useDebounce(cteOrderQuery, 150);
  const [cteForm, setCteForm] = useState<CTeFormState>(() => cloneCteForm());
  const [cteSourceNfeKey, setCteSourceNfeKey] = useState("");
  const [cteNote, setCteNote] = useState("CT-e gerado a partir da NF-e associada.");
  const [cteResult, setCteResult] = useState<Record<string, any> | null>(null);

  const [xmlInput, setXmlInput] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const emitNfeMutation = useMutation({
    mutationFn: async (variables: {
      orderId: string;
      payload: Record<string, any>;
      note?: string;
    }) => {
      return apiService.emitFiscalNFe(variables.orderId, variables.payload, {
        note: variables.note,
      });
    },
    onSuccess: (data) => {
      setNfeResult(data);
      if (data?.xml) {
        setXmlInput(data.xml);
      }
      toast({
        title: "NF-e emitida",
        description: `Documento registrado com chave ${data.nfe_key}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao emitir NF-e",
        description: error?.message ?? "Não foi possível comunicar com a API fiscal",
        variant: "destructive",
      });
    },
  });

  const emitCteMutation = useMutation({
    mutationFn: async (variables: {
      orderId: string;
      payload: Record<string, any>;
      note?: string;
      sourceNfeKey?: string;
    }) => {
      return apiService.emitFiscalCte(variables.orderId, variables.payload, {
        note: variables.note,
        sourceNfeKey: variables.sourceNfeKey,
      });
    },
    onSuccess: (data) => {
      setCteResult(data);
      if (data?.xml) {
        setXmlInput(data.xml);
      }
      toast({
        title: "CT-e emitido",
        description: `Documento registrado com chave ${data.cte_key}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao emitir CT-e",
        description: error?.message ?? "Não foi possível comunicar com a API fiscal",
        variant: "destructive",
      });
    },
  });

  const parsedXml = useMemo(() => {
    if (!xmlInput.trim()) return null;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, "text/xml");
      if (doc.getElementsByTagName("parsererror").length > 0) return null;
      return doc;
    } catch (error) {
      console.error("Erro ao analisar XML", error);
      return null;
    }
  }, [xmlInput]);

  const xmlHighlights = useMemo(() => {
    if (!parsedXml) return null;

    const rootName = parsedXml.documentElement?.nodeName?.toLowerCase() ?? "";
    let documentType: 'nfe' | 'cte' | 'unknown' = 'unknown';
    if (rootName.includes('cte')) documentType = 'cte';
    else if (rootName.includes('nfe')) documentType = 'nfe';

    const selectText = (selectors: string[]): string => {
      for (const selector of selectors) {
        const value = parsedXml.querySelector(selector)?.textContent?.trim();
        if (value) {
          return value;
        }
      }
      return '-';
    };

    let chave = '-';
    if (documentType === 'nfe') {
      const inf = parsedXml.querySelector('infNFe');
      chave = inf?.getAttribute('Id')?.replace(/^(?:NFe)/, '') ?? '-';
    } else if (documentType === 'cte') {
      const inf = parsedXml.querySelector('infCte');
      if (inf) {
        chave = inf.getAttribute('Id')?.replace(/^(?:CTe)/, '') ?? '-';
      } else {
        chave = selectText(['protCTe > infProt > chCTe', 'chCTe']);
      }
    } else {
      const fallback = parsedXml.querySelector('infNFe, infCte, chCTe');
      if (fallback instanceof Element) {
        const attr = fallback.getAttribute('Id');
        chave = attr?.replace(/^(?:NFe|CTe)/, '') ?? fallback.textContent ?? '-';
      } else {
        chave = fallback?.textContent ?? '-';
      }
    }

    const emissor = selectText(['emit > xNome', 'emit > xFant']);
    const destinatario = documentType === 'cte'
      ? selectText(['dest > xNome', 'dest > xFant', 'rem > xNome'])
      : selectText(['dest > xNome']);

    let valorTotal = '-';
    if (documentType === 'nfe') {
      valorTotal = selectText(['total > ICMSTot > vNF', 'ICMSTot > vNF', 'vNF']);
    } else if (documentType === 'cte') {
      valorTotal = selectText(['vPrest > vTPrest', 'infCTeNorm > infCarga > vCarga']);
    } else {
      valorTotal = selectText(['total > ICMSTot > vNF', 'vPrest > vTPrest']);
    }

    return {
      documentType,
      chave,
      emissor,
      destinatario,
      valorTotal,
    };
  }, [parsedXml]);

  const suggestionList: OrderSuggestion[] = useMemo(() => {
    if (!orders?.length) return [];
    const searchInput = nfeOrderQueryDebounced.trim();
    if (!searchInput) {
      return orders.slice(0, 5).map((entry) => ({
        value: entry.order_id,
        label: `${entry.order_id} · ${entry.title ?? "Sem título"}`,
      }));
    }

    const candidates = orders.map((entry) => ({
      value: entry.order_id,
      label: `${entry.order_id} · ${entry.title ?? "Sem título"}`,
      raw: entry,
    }));

    return matchSorter(candidates, searchInput, {
      keys: ["value", "raw.title", "raw.customer_name"],
    })
      .slice(0, 5)
      .map((item) => ({ value: item.value, label: item.label }));
  }, [orders, nfeOrderQueryDebounced]);

  const cteSuggestionList: OrderSuggestion[] = useMemo(() => {
    if (!orders?.length) return [];
    const searchInput = cteOrderQueryDebounced.trim();
    if (!searchInput) {
      return orders.slice(0, 5).map((entry) => ({
        value: entry.order_id,
        label: `${entry.order_id} · ${entry.title ?? "Sem título"}`,
      }));
    }

    const candidates = orders.map((entry) => ({
      value: entry.order_id,
      label: `${entry.order_id} · ${entry.title ?? "Sem título"}`,
      raw: entry,
    }));

    return matchSorter(candidates, searchInput, {
      keys: ["value", "raw.title", "raw.customer_name"],
    })
      .slice(0, 5)
      .map((item) => ({ value: item.value, label: item.label }));
  }, [orders, cteOrderQueryDebounced]);

  const setNfeField = (path: string, value: string) => {
    setNfeForm((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as NFeFormState;
      const segments = path.split(".");
      let cursor: any = updated;
      for (let i = 0; i < segments.length - 1; i += 1) {
        cursor = cursor[segments[i]];
      }
      cursor[segments[segments.length - 1]] = value;
      return updated;
    });
  };

  const handleEmitNfe = async () => {
    if (!nfeOrderId.trim()) {
      toast({
        title: "Informe a Order",
        description: "É necessário informar o ID da Order antes de emitir a NF-e",
        variant: "destructive",
      });
      return;
    }

    const missingFields: string[] = [];

    const requiredIde = ["cUF", "natOp", "mod", "serie", "nNF", "dhEmi", "tpNF", "cMunFG", "tpAmb"];
    requiredIde.forEach((field) => {
      if (!(nfeForm.ide as any)[field]) {
        missingFields.push(`ide.${field}`);
      }
    });

    const requiredEmit = ["CNPJ", "xNome", "xFant", "IE", "CRT"];
    requiredEmit.forEach((field) => {
      if (!(nfeForm.emit as any)[field]) {
        missingFields.push(`emit.${field}`);
      }
    });

    REQUIRED_ADDRESS_FIELDS.forEach((field) => {
      if (!nfeForm.emit.enderEmit[field]) {
        missingFields.push(`Endereço do emitente: ${field}`);
      }
      if (!nfeForm.dest.enderDest[field]) {
        missingFields.push(`Endereço do destinatário: ${field}`);
      }
    });

    const requiredDest = ["CNPJ", "xNome", "indIEDest"];
    requiredDest.forEach((field) => {
      if (!(nfeForm.dest as any)[field]) {
        missingFields.push(`dest.${field}`);
      }
    });

    const requiredProduct = ["cProd", "xProd", "NCM", "CFOP", "qCom", "vUnCom", "vProd"];
    requiredProduct.forEach((field) => {
      if (!nfeForm.item.prod[field as keyof typeof nfeForm.item.prod]) {
        missingFields.push(`item.prod.${field}`);
      }
    });

    if (!nfeForm.pag.vPag) {
      missingFields.push("pag.vPag");
    }

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios pendentes",
        description: missingFields.join(", "),
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ide: {
        ...nfeForm.ide,
        NFref: nfeForm.ide.NFref ? [nfeForm.ide.NFref] : [],
      },
      emit: {
        CNPJ: nfeForm.emit.CNPJ,
        xNome: nfeForm.emit.xNome,
        xFant: nfeForm.emit.xFant,
        IE: nfeForm.emit.IE,
        CRT: nfeForm.emit.CRT,
        enderEmit: { ...nfeForm.emit.enderEmit },
      },
      dest: {
        CNPJ: nfeForm.dest.CNPJ,
        xNome: nfeForm.dest.xNome,
        indIEDest: nfeForm.dest.indIEDest,
        IE: nfeForm.dest.IE,
        email: nfeForm.dest.email,
        enderDest: { ...nfeForm.dest.enderDest },
      },
      items: [
        {
          prod: { ...nfeForm.item.prod },
          imposto: {
            ICMS: {
              ICMS00: {
                orig: nfeForm.item.imposto.orig,
                CST: nfeForm.item.imposto.CST,
                modBC: nfeForm.item.imposto.modBC,
                vBC: nfeForm.item.imposto.vBC,
                pICMS: nfeForm.item.imposto.pICMS,
                vICMS: nfeForm.item.imposto.vICMS,
              },
            },
            PIS: {
              PISAliq: {
                CST: nfeForm.item.imposto.CST,
                vBC: nfeForm.item.imposto.vBC,
                pPIS: nfeForm.item.imposto.pPIS,
                vPIS: nfeForm.item.imposto.vPIS,
              },
            },
            COFINS: {
              COFINSAliq: {
                CST: nfeForm.item.imposto.CST,
                vBC: nfeForm.item.imposto.vBC,
                pCOFINS: nfeForm.item.imposto.pCOFINS,
                vCOFINS: nfeForm.item.imposto.vCOFINS,
              },
            },
            vTotTrib: nfeForm.item.imposto.vTotTrib,
          },
        },
      ],
      transp: { ...nfeForm.transp },
      pag: {
        detPag: [
          {
            indPag: nfeForm.pag.indPag,
            tPag: nfeForm.pag.tPag,
            vPag: nfeForm.pag.vPag,
            card: {
              tpIntegra: nfeForm.pag.tpIntegra,
              CNPJ: nfeForm.pag.cardCNPJ,
              tBand: nfeForm.pag.tBand,
              cAut: nfeForm.pag.cAut,
            },
          },
        ],
        vTroco: nfeForm.pag.vTroco,
      },
      infAdic: { ...nfeForm.infAdic },
      totalOverrides: { ...nfeForm.totalOverrides },
    };

    try {
      await emitNfeMutation.mutateAsync({
        orderId: nfeOrderId,
        payload,
        note: nfeNote,
      });
    } catch (error) {
      // onError handler already exibe mensagem
    }
  };

  const setCteField = (path: string, value: string) => {
    setCteForm((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as CTeFormState;
      const segments = path.split(".");
      let cursor: any = updated;
      for (let i = 0; i < segments.length - 1; i += 1) {
        cursor = cursor[segments[i]];
      }
      cursor[segments[segments.length - 1]] = value;
      return updated;
    });
  };

  const handleEmitCte = async () => {
    if (!cteOrderId.trim()) {
      toast({
        title: "Informe a Order",
        description: "É necessário informar o ID da Order antes de emitir o CT-e",
        variant: "destructive",
      });
      return;
    }

    const missing: string[] = [];

    ["cUF", "CFOP", "natOp", "mod", "serie", "nCT", "dhEmi", "modal", "tpServ", "cMunEnv"].forEach((field) => {
      if (!(cteForm.ide as any)[field]) {
        missing.push(`ide.${field}`);
      }
    });

    ["CNPJ", "IE", "xNome"].forEach((field) => {
      if (!(cteForm.emit as any)[field]) {
        missing.push(`emit.${field}`);
      }
    });

    ["CNPJ", "IE", "xNome"].forEach((field) => {
      if (!(cteForm.rem as any)[field]) {
        missing.push(`rem.${field}`);
      }
    });

    ["CNPJ", "IE", "xNome"].forEach((field) => {
      if (!(cteForm.dest as any)[field]) {
        missing.push(`dest.${field}`);
      }
    });

    REQUIRED_ADDRESS_FIELDS.forEach((field) => {
      if (!cteForm.emit.enderEmit[field]) {
        missing.push(`Endereço do emitente: ${field}`);
      }
      if (!cteForm.rem.enderReme[field]) {
        missing.push(`Endereço do remetente: ${field}`);
      }
      if (!cteForm.dest.enderDest[field]) {
        missing.push(`Endereço do destinatário: ${field}`);
      }
      if (!cteForm.toma.toma3.enderToma[field]) {
        missing.push(`Endereço do tomador: ${field}`);
      }
    });

    if (!cteForm.toma.toma3.CNPJ) missing.push("toma.toma3.CNPJ");
    if (!cteForm.toma.toma3.xNome) missing.push("toma.toma3.xNome");

    if (!cteForm.vPrest.vTPrest) missing.push("vPrest.vTPrest");
    if (!cteForm.vPrest.vRec) missing.push("vPrest.vRec");
    if (!cteForm.imp.vBC) missing.push("imp.vBC");
    if (!cteForm.imp.pICMS) missing.push("imp.pICMS");
    if (!cteForm.imp.vICMS) missing.push("imp.vICMS");
    if (!cteForm.infCarga.vCarga) missing.push("infCarga.vCarga");
    if (!cteForm.infCarga.qCarga) missing.push("infCarga.qCarga");
    if (!cteForm.respTec.CNPJ) missing.push("respTec.CNPJ");
    if (!cteForm.respTec.xContato) missing.push("respTec.xContato");
    if (!cteForm.respTec.email) missing.push("respTec.email");

    if (missing.length > 0) {
      toast({
        title: "Campos obrigatórios pendentes",
        description: missing.join(", "),
        variant: "destructive",
      });
      return;
    }

    const component = [
      { xNome: cteForm.vPrest.component1Nome, vComp: cteForm.vPrest.component1Valor },
      { xNome: cteForm.vPrest.component2Nome, vComp: cteForm.vPrest.component2Valor },
      { xNome: cteForm.vPrest.component3Nome, vComp: cteForm.vPrest.component3Valor },
    ].filter((item) => item.xNome && item.vComp);

    const payload = {
      ide: { ...cteForm.ide },
      emit: {
        CNPJ: cteForm.emit.CNPJ,
        IE: cteForm.emit.IE,
        xNome: cteForm.emit.xNome,
        xFant: cteForm.emit.xFant,
        enderEmit: { ...cteForm.emit.enderEmit },
      },
      rem: {
        CNPJ: cteForm.rem.CNPJ,
        IE: cteForm.rem.IE,
        xNome: cteForm.rem.xNome,
        fone: cteForm.rem.fone,
        enderReme: { ...cteForm.rem.enderReme },
      },
      dest: {
        CNPJ: cteForm.dest.CNPJ,
        IE: cteForm.dest.IE,
        xNome: cteForm.dest.xNome,
        fone: cteForm.dest.fone,
        enderDest: { ...cteForm.dest.enderDest },
      },
      toma: {
        toma: cteForm.toma.toma,
        toma3: {
          CNPJ: cteForm.toma.toma3.CNPJ,
          IE: cteForm.toma.toma3.IE,
          xNome: cteForm.toma.toma3.xNome,
          fone: cteForm.toma.toma3.fone,
          enderToma: { ...cteForm.toma.toma3.enderToma },
        },
      },
      vPrest: {
        vTPrest: cteForm.vPrest.vTPrest,
        vRec: cteForm.vPrest.vRec,
        component,
      },
      imp: {
        ICMS: {
          ICMS00: {
            CST: cteForm.imp.CST,
            orig: cteForm.imp.orig,
            vBC: cteForm.imp.vBC,
            pICMS: cteForm.imp.pICMS,
            vICMS: cteForm.imp.vICMS,
          },
        },
        infAdFisco: cteForm.imp.infAdFisco,
      },
      infCarga: {
        vCarga: cteForm.infCarga.vCarga,
        proPred: cteForm.infCarga.proPred,
        infQ: [
          {
            cUnid: cteForm.infCarga.cUnid,
            tpMed: cteForm.infCarga.tpMed,
            qCarga: cteForm.infCarga.qCarga,
          },
        ],
      },
      infModal: {
        versaoModal: cteForm.infModal.versaoModal,
        rodo: {
          RNTRC: cteForm.infModal.RNTRC,
        },
      },
      autXML: cteForm.autXMLCNPJ ? [{ CNPJ: cteForm.autXMLCNPJ }] : [],
      prot: {
        infRespTec: { ...cteForm.respTec },
      },
    };

    try {
      await emitCteMutation.mutateAsync({
        orderId: cteOrderId,
        payload,
        note: cteNote,
        sourceNfeKey: cteSourceNfeKey || undefined,
      });
    } catch (error) {
      // tratado no onError da mutation
    }
  };

  const handleCopy = async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copiado!", description: value });
    } catch (error) {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  };

  const handleGeneratePdf = async () => {
    if (!xmlInput.trim()) {
      toast({
        title: "XML vazio",
        description: "Cole um XML válido para gerar o PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPdf(true);

      const response = await apiService.generateFiscalPdf({
        xml: xmlInput,
        documentType: xmlHighlights?.documentType === 'nfe' || xmlHighlights?.documentType === 'cte'
          ? xmlHighlights.documentType
          : undefined,
        fileName: xmlHighlights?.chave && xmlHighlights.chave !== '-' ? `documento-fiscal-${xmlHighlights.chave}.pdf` : undefined,
      });

      const pdfBytes = Uint8Array.from(window.atob(response.pdf_base64), (char) => char.charCodeAt(0));
      const blob = new Blob([pdfBytes], { type: response.content_type });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF gerado",
        description: response.warnings?.length
          ? `Arquivo ${response.filename} salvo. Atenção: ${response.warnings.join('; ')}`
          : `Arquivo ${response.filename} salvo com sucesso.`,
      });

      if (response.warnings?.length) {
        console.warn('Avisos ao gerar DANFE/DACTE:', response.warnings);
      }
    } catch (error: any) {
      console.error('Erro ao gerar DANFE/DACTE', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error?.message ?? 'Não foi possível converter o XML em PDF.',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-full overflow-auto bg-muted/10">
        <div className="mx-auto max-w-7xl space-y-6 p-6">
          <header className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="uppercase tracking-wider text-xs">Integração Fiscal</span>
            </div>
            <h1 className="text-3xl font-semibold">NF-e &amp; CT-e Assistidos</h1>
            <p className="text-muted-foreground">
              Gere documentos fiscais eletrônicos a partir das Orders e visualize rapidamente o XML em formato PDF.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-primary" />
                  Emissão de NF-e
                </CardTitle>
                <CardDescription>
                  Preencha os dados necessários para a NF-e conforme o contrato do serviço fiscal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Digite para buscar Order"
                        value={nfeOrderQuery}
                        onChange={(event) => {
                          const value = event.target.value;
                          setNfeOrderQuery(value);
                          setNfeOrderId(value);
                        }}
                      />
                    </div>
                    {suggestionList.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow">
                        <p className="mb-1 text-xs text-muted-foreground">Escolha uma Order sugerida:</p>
                        <ul className="space-y-1 text-sm">
                          {suggestionList.map((item) => (
                            <li key={item.value}>
                              <button
                                type="button"
                                className="w-full rounded px-2 py-1 text-left hover:bg-accent"
                                onClick={() => {
                                  setNfeOrderId(item.value);
                                  setNfeOrderQuery(item.value);
                                }}
                              >
                                {item.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <LabeledInput
                  label="Observação"
                  value={nfeNote}
                  onChange={setNfeNote}
                  placeholder="Mensagem que será anexada à Order"
                />

                <div className="grid gap-6 rounded-lg border p-4">
                  <div>
                    <h4 className="text-sm font-semibold">Identificação (IDE)</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="cUF" value={nfeForm.ide.cUF} required onChange={(value) => setNfeField("ide.cUF", value)} />
                      <LabeledInput label="cNF" value={nfeForm.ide.cNF} onChange={(value) => setNfeField("ide.cNF", value)} />
                      <LabeledInput label="natOp" value={nfeForm.ide.natOp} required onChange={(value) => setNfeField("ide.natOp", value)} />
                      <LabeledInput label="mod" value={nfeForm.ide.mod} required onChange={(value) => setNfeField("ide.mod", value)} />
                      <LabeledInput label="serie" value={nfeForm.ide.serie} required onChange={(value) => setNfeField("ide.serie", value)} />
                      <LabeledInput label="nNF" value={nfeForm.ide.nNF} required onChange={(value) => setNfeField("ide.nNF", value)} />
                      <LabeledInput label="dhEmi" value={nfeForm.ide.dhEmi} required onChange={(value) => setNfeField("ide.dhEmi", value)} />
                      <LabeledInput label="dhSaiEnt" value={nfeForm.ide.dhSaiEnt} onChange={(value) => setNfeField("ide.dhSaiEnt", value)} />
                      <LabeledInput label="tpNF" value={nfeForm.ide.tpNF} required onChange={(value) => setNfeField("ide.tpNF", value)} />
                      <LabeledInput label="idDest" value={nfeForm.ide.idDest} onChange={(value) => setNfeField("ide.idDest", value)} />
                      <LabeledInput label="cMunFG" value={nfeForm.ide.cMunFG} required onChange={(value) => setNfeField("ide.cMunFG", value)} />
                      <LabeledInput label="NFref" value={nfeForm.ide.NFref} onChange={(value) => setNfeField("ide.NFref", value)} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Emitente</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="CNPJ" value={nfeForm.emit.CNPJ} required onChange={(value) => setNfeField("emit.CNPJ", value)} />
                      <LabeledInput label="xNome" value={nfeForm.emit.xNome} required onChange={(value) => setNfeField("emit.xNome", value)} />
                      <LabeledInput label="xFant" value={nfeForm.emit.xFant} required onChange={(value) => setNfeField("emit.xFant", value)} />
                      <LabeledInput label="IE" value={nfeForm.emit.IE} required onChange={(value) => setNfeField("emit.IE", value)} />
                      <LabeledInput label="CRT" value={nfeForm.emit.CRT} required onChange={(value) => setNfeField("emit.CRT", value)} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {Object.keys(nfeForm.emit.enderEmit).map((key) => (
                        <LabeledInput
                          key={`emit-${key}`}
                          label={`Endereço emit. ${key}`}
                          value={nfeForm.emit.enderEmit[key as keyof AddressField]}
                          required={REQUIRED_ADDRESS_FIELDS.includes(key as keyof AddressField)}
                          onChange={(value) => setNfeField(`emit.enderEmit.${key}`, value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Destinatário</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="CNPJ" value={nfeForm.dest.CNPJ} required onChange={(value) => setNfeField("dest.CNPJ", value)} />
                      <LabeledInput label="xNome" value={nfeForm.dest.xNome} required onChange={(value) => setNfeField("dest.xNome", value)} />
                      <LabeledInput label="indIEDest" value={nfeForm.dest.indIEDest} required onChange={(value) => setNfeField("dest.indIEDest", value)} />
                      <LabeledInput label="IE" value={nfeForm.dest.IE} onChange={(value) => setNfeField("dest.IE", value)} />
                      <LabeledInput label="email" value={nfeForm.dest.email} onChange={(value) => setNfeField("dest.email", value)} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {Object.keys(nfeForm.dest.enderDest).map((key) => (
                        <LabeledInput
                          key={`dest-${key}`}
                          label={`Endereço dest. ${key}`}
                          value={nfeForm.dest.enderDest[key as keyof AddressField]}
                          required={REQUIRED_ADDRESS_FIELDS.includes(key as keyof AddressField)}
                          onChange={(value) => setNfeField(`dest.enderDest.${key}`, value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Itens</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {Object.keys(nfeForm.item.prod).map((key) => (
                        <LabeledInput
                          key={`prod-${key}`}
                          label={`Prod. ${key}`}
                          value={nfeForm.item.prod[key as keyof typeof nfeForm.item.prod]}
                          onChange={(value) => setNfeField(`item.prod.${key}`, value)}
                        />
                      ))}
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="orig" value={nfeForm.item.imposto.orig} onChange={(value) => setNfeField("item.imposto.orig", value)} />
                      <LabeledInput label="CST" value={nfeForm.item.imposto.CST} onChange={(value) => setNfeField("item.imposto.CST", value)} />
                      <LabeledInput label="modBC" value={nfeForm.item.imposto.modBC} onChange={(value) => setNfeField("item.imposto.modBC", value)} />
                      <LabeledInput label="vBC" value={nfeForm.item.imposto.vBC} onChange={(value) => setNfeField("item.imposto.vBC", value)} />
                      <LabeledInput label="pICMS" value={nfeForm.item.imposto.pICMS} onChange={(value) => setNfeField("item.imposto.pICMS", value)} />
                      <LabeledInput label="vICMS" value={nfeForm.item.imposto.vICMS} onChange={(value) => setNfeField("item.imposto.vICMS", value)} />
                      <LabeledInput label="pPIS" value={nfeForm.item.imposto.pPIS} onChange={(value) => setNfeField("item.imposto.pPIS", value)} />
                      <LabeledInput label="vPIS" value={nfeForm.item.imposto.vPIS} onChange={(value) => setNfeField("item.imposto.vPIS", value)} />
                      <LabeledInput label="pCOFINS" value={nfeForm.item.imposto.pCOFINS} onChange={(value) => setNfeField("item.imposto.pCOFINS", value)} />
                      <LabeledInput label="vCOFINS" value={nfeForm.item.imposto.vCOFINS} onChange={(value) => setNfeField("item.imposto.vCOFINS", value)} />
                      <LabeledInput label="vTotTrib" value={nfeForm.item.imposto.vTotTrib} onChange={(value) => setNfeField("item.imposto.vTotTrib", value)} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Pagamento</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="indPag" value={nfeForm.pag.indPag} onChange={(value) => setNfeField("pag.indPag", value)} />
                      <LabeledInput label="tPag" value={nfeForm.pag.tPag} onChange={(value) => setNfeField("pag.tPag", value)} />
                      <LabeledInput label="vPag" value={nfeForm.pag.vPag} required onChange={(value) => setNfeField("pag.vPag", value)} />
                      <LabeledInput label="tpIntegra" value={nfeForm.pag.tpIntegra} onChange={(value) => setNfeField("pag.tpIntegra", value)} />
                      <LabeledInput label="card CNPJ" value={nfeForm.pag.cardCNPJ} onChange={(value) => setNfeField("pag.cardCNPJ", value)} />
                      <LabeledInput label="tBand" value={nfeForm.pag.tBand} onChange={(value) => setNfeField("pag.tBand", value)} />
                      <LabeledInput label="cAut" value={nfeForm.pag.cAut} onChange={(value) => setNfeField("pag.cAut", value)} />
                      <LabeledInput label="vTroco" value={nfeForm.pag.vTroco} onChange={(value) => setNfeField("pag.vTroco", value)} />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <LabeledTextarea label="infAdFisco" value={nfeForm.infAdic.infAdFisco} onChange={(value) => setNfeField("infAdic.infAdFisco", value)} />
                    <LabeledTextarea label="infCpl" value={nfeForm.infAdic.infCpl} onChange={(value) => setNfeField("infAdic.infCpl", value)} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <LabeledInput label="Override vPIS" value={nfeForm.totalOverrides.vPIS} onChange={(value) => setNfeField("totalOverrides.vPIS", value)} />
                    <LabeledInput label="Override vCOFINS" value={nfeForm.totalOverrides.vCOFINS} onChange={(value) => setNfeField("totalOverrides.vCOFINS", value)} />
                    <LabeledInput label="Override vTotTrib" value={nfeForm.totalOverrides.vTotTrib} onChange={(value) => setNfeField("totalOverrides.vTotTrib", value)} />
                    <LabeledInput label="Override vICMS" value={nfeForm.totalOverrides.vICMS} onChange={(value) => setNfeField("totalOverrides.vICMS", value)} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleEmitNfe} disabled={emitNfeMutation.isPending}>
                    {emitNfeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ArrowRightCircle className="mr-2 h-4 w-4" />
                        Emitir NF-e
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNfeForm(cloneNfeForm());
                      setNfeNote("NF-e gerada via painel fiscal.");
                    }}
                    disabled={emitNfeMutation.isPending}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Restaurar exemplo
                  </Button>
                </div>

                {nfeResult && (
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <h4 className="text-sm font-semibold">NF-e registrada</h4>
                      <Badge variant="outline">{nfeResult.status}</Badge>
                    </div>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <dt className="text-muted-foreground">Chave:</dt>
                        <dd className="flex items-center gap-2 font-mono text-xs">
                          {nfeResult.nfe_key || "-"}
                          {nfeResult.nfe_key && (
                            <Button size="icon" variant="ghost" onClick={() => handleCopy(nfeResult.nfe_key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">Documento:</dt>
                        <dd className="font-mono text-xs">{nfeResult.document_file_id}</dd>
                      </div>
                      {nfeResult.issued_at && (
                        <div className="flex gap-2">
                          <dt className="text-muted-foreground">Emitido em:</dt>
                          <dd>{nfeResult.issued_at}</dd>
                        </div>
                      )}
                    </dl>
                    {nfeResult.xml && (
                      <div className="mt-3">
                        <LabeledTextarea
                          label="XML retornado"
                          value={nfeResult.xml}
                          onChange={() => {}}
                          readOnly
                          rows={6}
                        />
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleCopy(nfeResult.xml)}>
                            <Copy className="mr-2 h-4 w-4" />Copiar XML
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setXmlInput(nfeResult.xml)}>
                            Preencher conversor
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-brand-primary" />
                  Emissão de CT-e
                </CardTitle>
                <CardDescription>
                  Gere o CT-e utilizando os dados da NF-e vinculada e monitore o retorno em tempo real.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Digite para buscar Order"
                        value={cteOrderQuery}
                        onChange={(event) => {
                          const value = event.target.value;
                          setCteOrderQuery(value);
                          setCteOrderId(value);
                        }}
                      />
                    </div>
                    {cteSuggestionList.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow">
                        <p className="mb-1 text-xs text-muted-foreground">Escolha uma Order sugerida:</p>
                        <ul className="space-y-1 text-sm">
                          {cteSuggestionList.map((item) => (
                            <li key={item.value}>
                              <button
                                type="button"
                                className="w-full rounded px-2 py-1 text-left hover:bg-accent"
                                onClick={() => {
                                  setCteOrderId(item.value);
                                  setCteOrderQuery(item.value);
                                }}
                              >
                                {item.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <LabeledInput
                  label="Chave da NF-e (opcional)"
                  value={cteSourceNfeKey}
                  onChange={setCteSourceNfeKey}
                  placeholder="Utilize para rastrear o relacionamento NF-e/CT-e"
                />
                <LabeledInput label="Observação" value={cteNote} onChange={setCteNote} />

                <div className="grid gap-6 rounded-lg border p-4">
                  <div>
                    <h4 className="text-sm font-semibold">Identificação (IDE)</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="cUF" value={cteForm.ide.cUF} required onChange={(value) => setCteField("ide.cUF", value)} />
                      <LabeledInput label="cCT" value={cteForm.ide.cCT} onChange={(value) => setCteField("ide.cCT", value)} />
                      <LabeledInput label="CFOP" value={cteForm.ide.CFOP} required onChange={(value) => setCteField("ide.CFOP", value)} />
                      <LabeledInput label="natOp" value={cteForm.ide.natOp} required onChange={(value) => setCteField("ide.natOp", value)} />
                      <LabeledInput label="mod" value={cteForm.ide.mod} required onChange={(value) => setCteField("ide.mod", value)} />
                      <LabeledInput label="serie" value={cteForm.ide.serie} required onChange={(value) => setCteField("ide.serie", value)} />
                      <LabeledInput label="nCT" value={cteForm.ide.nCT} required onChange={(value) => setCteField("ide.nCT", value)} />
                      <LabeledInput label="dhEmi" value={cteForm.ide.dhEmi} required onChange={(value) => setCteField("ide.dhEmi", value)} />
                      <LabeledInput label="tpImp" value={cteForm.ide.tpImp} onChange={(value) => setCteField("ide.tpImp", value)} />
                      <LabeledInput label="tpEmis" value={cteForm.ide.tpEmis} onChange={(value) => setCteField("ide.tpEmis", value)} />
                      <LabeledInput label="tpAmb" value={cteForm.ide.tpAmb} required onChange={(value) => setCteField("ide.tpAmb", value)} />
                      <LabeledInput label="tpCTe" value={cteForm.ide.tpCTe} onChange={(value) => setCteField("ide.tpCTe", value)} />
                      <LabeledInput label="procEmi" value={cteForm.ide.procEmi} onChange={(value) => setCteField("ide.procEmi", value)} />
                      <LabeledInput label="verProc" value={cteForm.ide.verProc} onChange={(value) => setCteField("ide.verProc", value)} />
                      <LabeledInput label="cMunEnv" value={cteForm.ide.cMunEnv} required onChange={(value) => setCteField("ide.cMunEnv", value)} />
                      <LabeledInput label="xMunEnv" value={cteForm.ide.xMunEnv} onChange={(value) => setCteField("ide.xMunEnv", value)} />
                      <LabeledInput label="UFEnv" value={cteForm.ide.UFEnv} onChange={(value) => setCteField("ide.UFEnv", value)} />
                      <LabeledInput label="modal" value={cteForm.ide.modal} required onChange={(value) => setCteField("ide.modal", value)} />
                      <LabeledInput label="tpServ" value={cteForm.ide.tpServ} required onChange={(value) => setCteField("ide.tpServ", value)} />
                      <LabeledInput label="indIEToma" value={cteForm.ide.indIEToma} onChange={(value) => setCteField("ide.indIEToma", value)} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Emitente</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="CNPJ" value={cteForm.emit.CNPJ} required onChange={(value) => setCteField("emit.CNPJ", value)} />
                      <LabeledInput label="IE" value={cteForm.emit.IE} required onChange={(value) => setCteField("emit.IE", value)} />
                      <LabeledInput label="xNome" value={cteForm.emit.xNome} required onChange={(value) => setCteField("emit.xNome", value)} />
                      <LabeledInput label="xFant" value={cteForm.emit.xFant} onChange={(value) => setCteField("emit.xFant", value)} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {Object.keys(cteForm.emit.enderEmit).map((key) => (
                        <LabeledInput
                          key={`cte-emit-${key}`}
                          label={`Endereço emit. ${key}`}
                          value={cteForm.emit.enderEmit[key as keyof AddressField]}
                          required={REQUIRED_ADDRESS_FIELDS.includes(key as keyof AddressField)}
                          onChange={(value) => setCteField(`emit.enderEmit.${key}`, value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Remetente</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="CNPJ" value={cteForm.rem.CNPJ} required onChange={(value) => setCteField("rem.CNPJ", value)} />
                      <LabeledInput label="IE" value={cteForm.rem.IE} required onChange={(value) => setCteField("rem.IE", value)} />
                      <LabeledInput label="xNome" value={cteForm.rem.xNome} required onChange={(value) => setCteField("rem.xNome", value)} />
                      <LabeledInput label="fone" value={cteForm.rem.fone} onChange={(value) => setCteField("rem.fone", value)} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {Object.keys(cteForm.rem.enderReme).map((key) => (
                        <LabeledInput
                          key={`cte-rem-${key}`}
                          label={`Endereço rem. ${key}`}
                          value={cteForm.rem.enderReme[key as keyof AddressField]}
                          required={REQUIRED_ADDRESS_FIELDS.includes(key as keyof AddressField)}
                          onChange={(value) => setCteField(`rem.enderReme.${key}`, value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Destinatário</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="CNPJ" value={cteForm.dest.CNPJ} required onChange={(value) => setCteField("dest.CNPJ", value)} />
                      <LabeledInput label="IE" value={cteForm.dest.IE} required onChange={(value) => setCteField("dest.IE", value)} />
                      <LabeledInput label="xNome" value={cteForm.dest.xNome} required onChange={(value) => setCteField("dest.xNome", value)} />
                      <LabeledInput label="fone" value={cteForm.dest.fone} onChange={(value) => setCteField("dest.fone", value)} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {Object.keys(cteForm.dest.enderDest).map((key) => (
                        <LabeledInput
                          key={`cte-dest-${key}`}
                          label={`Endereço dest. ${key}`}
                          value={cteForm.dest.enderDest[key as keyof AddressField]}
                          required={REQUIRED_ADDRESS_FIELDS.includes(key as keyof AddressField)}
                          onChange={(value) => setCteField(`dest.enderDest.${key}`, value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Tomador</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="toma" value={cteForm.toma.toma} required onChange={(value) => setCteField("toma.toma", value)} />
                      <LabeledInput label="CNPJ" value={cteForm.toma.toma3.CNPJ} required onChange={(value) => setCteField("toma.toma3.CNPJ", value)} />
                      <LabeledInput label="IE" value={cteForm.toma.toma3.IE} onChange={(value) => setCteField("toma.toma3.IE", value)} />
                      <LabeledInput label="xNome" value={cteForm.toma.toma3.xNome} required onChange={(value) => setCteField("toma.toma3.xNome", value)} />
                      <LabeledInput label="fone" value={cteForm.toma.toma3.fone} onChange={(value) => setCteField("toma.toma3.fone", value)} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {Object.keys(cteForm.toma.toma3.enderToma).map((key) => (
                        <LabeledInput
                          key={`cte-toma-${key}`}
                          label={`Endereço toma. ${key}`}
                          value={cteForm.toma.toma3.enderToma[key as keyof AddressField]}
                          required={REQUIRED_ADDRESS_FIELDS.includes(key as keyof AddressField)}
                          onChange={(value) => setCteField(`toma.toma3.enderToma.${key}`, value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Prestação</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="vTPrest" value={cteForm.vPrest.vTPrest} required onChange={(value) => setCteField("vPrest.vTPrest", value)} />
                      <LabeledInput label="vRec" value={cteForm.vPrest.vRec} required onChange={(value) => setCteField("vPrest.vRec", value)} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="Comp1 nome" value={cteForm.vPrest.component1Nome} onChange={(value) => setCteField("vPrest.component1Nome", value)} />
                      <LabeledInput label="Comp1 valor" value={cteForm.vPrest.component1Valor} onChange={(value) => setCteField("vPrest.component1Valor", value)} />
                      <LabeledInput label="Comp2 nome" value={cteForm.vPrest.component2Nome} onChange={(value) => setCteField("vPrest.component2Nome", value)} />
                      <LabeledInput label="Comp2 valor" value={cteForm.vPrest.component2Valor} onChange={(value) => setCteField("vPrest.component2Valor", value)} />
                      <LabeledInput label="Comp3 nome" value={cteForm.vPrest.component3Nome} onChange={(value) => setCteField("vPrest.component3Nome", value)} />
                      <LabeledInput label="Comp3 valor" value={cteForm.vPrest.component3Valor} onChange={(value) => setCteField("vPrest.component3Valor", value)} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Impostos</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="CST" value={cteForm.imp.CST} onChange={(value) => setCteField("imp.CST", value)} />
                      <LabeledInput label="orig" value={cteForm.imp.orig} onChange={(value) => setCteField("imp.orig", value)} />
                      <LabeledInput label="vBC" value={cteForm.imp.vBC} required onChange={(value) => setCteField("imp.vBC", value)} />
                      <LabeledInput label="pICMS" value={cteForm.imp.pICMS} required onChange={(value) => setCteField("imp.pICMS", value)} />
                      <LabeledInput label="vICMS" value={cteForm.imp.vICMS} required onChange={(value) => setCteField("imp.vICMS", value)} />
                    </div>
                    <div className="mt-3">
                      <LabeledTextarea label="infAdFisco" value={cteForm.imp.infAdFisco} onChange={(value) => setCteField("imp.infAdFisco", value)} rows={3} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Informações da Carga</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="vCarga" value={cteForm.infCarga.vCarga} required onChange={(value) => setCteField("infCarga.vCarga", value)} />
                      <LabeledInput label="proPred" value={cteForm.infCarga.proPred} onChange={(value) => setCteField("infCarga.proPred", value)} />
                      <LabeledInput label="cUnid" value={cteForm.infCarga.cUnid} onChange={(value) => setCteField("infCarga.cUnid", value)} />
                      <LabeledInput label="tpMed" value={cteForm.infCarga.tpMed} onChange={(value) => setCteField("infCarga.tpMed", value)} />
                      <LabeledInput label="qCarga" value={cteForm.infCarga.qCarga} required onChange={(value) => setCteField("infCarga.qCarga", value)} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Modal Rodoviário</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="versaoModal" value={cteForm.infModal.versaoModal} onChange={(value) => setCteField("infModal.versaoModal", value)} />
                      <LabeledInput label="RNTRC" value={cteForm.infModal.RNTRC} onChange={(value) => setCteField("infModal.RNTRC", value)} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Autorizados a acessar o XML</h4>
                    <LabeledInput label="CNPJ autorizada" value={cteForm.autXMLCNPJ} onChange={(value) => setCteField("autXMLCNPJ", value)} />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">Responsável Técnico</h4>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <LabeledInput label="CNPJ" value={cteForm.respTec.CNPJ} required onChange={(value) => setCteField("respTec.CNPJ", value)} />
                      <LabeledInput label="Contato" value={cteForm.respTec.xContato} required onChange={(value) => setCteField("respTec.xContato", value)} />
                      <LabeledInput label="E-mail" value={cteForm.respTec.email} required onChange={(value) => setCteField("respTec.email", value)} />
                      <LabeledInput label="Fone" value={cteForm.respTec.fone} onChange={(value) => setCteField("respTec.fone", value)} />
                    </div>
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleEmitCte} disabled={emitCteMutation.isPending}>
                    {emitCteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ArrowRightCircle className="mr-2 h-4 w-4" />
                        Emitir CT-e
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCteForm(cloneCteForm())}
                    disabled={emitCteMutation.isPending}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Restaurar exemplo
                  </Button>
                </div>

                {cteResult && (
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <h4 className="text-sm font-semibold">CT-e registrado</h4>
                      <Badge variant="outline">{cteResult.status}</Badge>
                    </div>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <dt className="text-muted-foreground">Chave:</dt>
                        <dd className="flex items-center gap-2 font-mono text-xs">
                          {cteResult.cte_key}
                          <Button size="icon" variant="ghost" onClick={() => handleCopy(cteResult.cte_key)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </dd>
                      </div>
                      {cteResult.related_nfe_key && (
                        <div className="flex gap-2 font-mono text-xs">
                          <dt className="text-muted-foreground">NF-e relacionada:</dt>
                          <dd>{cteResult.related_nfe_key}</dd>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">Documento:</dt>
                        <dd className="font-mono text-xs">{cteResult.document_file_id}</dd>
                      </div>
                    </dl>
                    {cteResult.xml && (
                      <div className="mt-3">
                        <LabeledTextarea
                          label="XML retornado"
                          value={cteResult.xml}
                          onChange={() => {}}
                          readOnly
                          rows={6}
                        />
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleCopy(cteResult.xml)}>
                            <Copy className="mr-2 h-4 w-4" />Copiar XML
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setXmlInput(cteResult.xml)}>
                            Preencher conversor
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-primary" />
                Conversor XML → PDF
              </CardTitle>
              <CardDescription>
                Cole o XML retornado pela API fiscal e gere um PDF rápido para auditoria ou compartilhamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium">XML do documento</label>
                <Textarea
                  value={xmlInput}
                  onChange={(event) => setXmlInput(event.target.value)}
                  rows={16}
                  spellCheck={false}
                  placeholder="Cole aqui o XML completo retornado pelo serviço fiscal"
                  className="font-mono text-xs"
                />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Gerar PDF
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setXmlInput("")}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-brand-primary" />
                    Pré-visualização
                  </div>
                  {parsedXml ? (
                    <dl className="mt-3 space-y-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Tipo</dt>
                        <dd className="font-mono text-xs uppercase">
                          {xmlHighlights?.documentType === 'nfe'
                            ? 'NF-e'
                            : xmlHighlights?.documentType === 'cte'
                              ? 'CT-e'
                              : 'Não identificado'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Chave</dt>
                        <dd className="font-mono text-xs">{xmlHighlights?.chave}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Emitente</dt>
                        <dd>{xmlHighlights?.emissor}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Destinatário</dt>
                        <dd>{xmlHighlights?.destinatario}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Valor</dt>
                        <dd>{xmlHighlights?.valorTotal || "-"}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="mt-0.5 h-4 w-4" />
                      Informe um XML válido para visualizar os principais campos e gerar o PDF.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Fiscal;
