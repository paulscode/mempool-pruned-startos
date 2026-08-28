import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { EXTERNAL_RETRY } from '../utils'

export const current = VersionInfo.of({
  version: '3.3.1:24',
  releaseNotes: {
    en_US: `The first release of Mempool Pruned, a build of Mempool that runs against a pruned Bitcoin node.

Mempool normally looks up a confirmed transaction by asking Bitcoin for it directly. That needs a transaction index, and a transaction index cannot be built on a pruned node, which is why the official package requires an archival one. This build asks the Electrum server instead. That server keeps its own index and fetches any block your node has dropped from the peer-to-peer network, so the explorer sees a whole chain on a node that is not storing one.

- Requires Electrs Pruned. The official Electrs package requires an archival node, which is the requirement this package exists to remove.
- Works with Bitcoin Core, Knots, Knots pre-RDTS and Knots BLAKE2b, pruned or archival. Nothing here asks you to change your node.
- A block page below your node's prune height is fetched from the network on demand, so it takes longer to load than a recent one. The page says so while it waits.
- Installs alongside the official Mempool. Each keeps its own database and its own address.`,
    es_ES: `Primera versión de Mempool Pruned, una compilación de Mempool que funciona con un nodo Bitcoin podado.

Normalmente Mempool consulta una transacción confirmada preguntándosela directamente a Bitcoin. Eso requiere un índice de transacciones, y un índice de transacciones no se puede construir en un nodo podado, razón por la cual el paquete oficial exige uno archival. Esta compilación se lo pregunta al servidor Electrum. Ese servidor mantiene su propio índice y descarga de la red peer-to-peer cualquier bloque que su nodo haya descartado, de modo que el explorador ve la cadena entera sobre un nodo que no la almacena.

- Requiere Electrs Pruned. El paquete oficial Electrs exige un nodo archival, que es justo el requisito que este paquete existe para eliminar.
- Funciona con Bitcoin Core, Knots, Knots pre-RDTS y Knots BLAKE2b, podados o archival. Nada de esto le pide que cambie su nodo.
- La página de un bloque por debajo de la altura de poda de su nodo se descarga de la red bajo demanda, así que tarda más en cargar que una reciente. La página lo indica mientras espera.
- Se instala junto al Mempool oficial. Cada uno mantiene su propia base de datos y su propia dirección.`,
    de_DE: `Die erste Veröffentlichung von Mempool Pruned, einem Mempool-Build, der mit einem beschnittenen (pruned) Bitcoin-Knoten läuft.

Mempool schlägt eine bestätigte Transaktion normalerweise nach, indem es Bitcoin direkt danach fragt. Das setzt einen Transaktionsindex voraus, und ein Transaktionsindex lässt sich auf einem beschnittenen Knoten nicht aufbauen. Genau deshalb verlangt das offizielle Paket einen archivierenden Knoten. Dieser Build fragt stattdessen den Electrum-Server. Der führt einen eigenen Index und holt jeden Block, den Ihr Knoten verworfen hat, aus dem Peer-to-Peer-Netz. So sieht der Explorer eine vollständige Kette auf einem Knoten, der keine vorhält.

- Setzt Electrs Pruned voraus. Das offizielle Electrs-Paket verlangt einen archivierenden Knoten, also genau die Voraussetzung, die dieses Paket beseitigen soll.
- Läuft mit Bitcoin Core, Knots, Knots pre-RDTS und Knots BLAKE2b, beschnitten oder archivierend. Nichts hier verlangt, dass Sie Ihren Knoten umstellen.
- Die Seite eines Blocks unterhalb der Prune-Höhe Ihres Knotens wird bei Bedarf aus dem Netz geholt und lädt daher länger als eine aktuelle. Die Seite sagt das, während sie wartet.
- Lässt sich neben dem offiziellen Mempool installieren. Jedes behält seine eigene Datenbank und seine eigene Adresse.`,
    pl_PL: `Pierwsze wydanie Mempool Pruned, wersji Mempoola działającej na przyciętym (pruned) węźle Bitcoina.

Mempool zwykle wyszukuje potwierdzoną transakcję, pytając o nią wprost Bitcoina. Wymaga to indeksu transakcji, a indeksu transakcji nie da się zbudować na przyciętym węźle i właśnie dlatego oficjalny pakiet wymaga węzła archiwalnego. Ta wersja pyta zamiast tego serwer Electrum. Serwer prowadzi własny indeks i pobiera z sieci peer-to-peer każdy blok, który twój węzeł odrzucił, więc eksplorator widzi cały łańcuch na węźle, który go nie przechowuje.

- Wymaga Electrs Pruned. Oficjalny pakiet Electrs wymaga węzła archiwalnego, czyli dokładnie tego wymogu, który ten pakiet ma znieść.
- Działa z Bitcoin Core, Knots, Knots pre-RDTS i Knots BLAKE2b, przyciętymi lub archiwalnymi. Nic tutaj nie każe ci zmieniać węzła.
- Strona bloku poniżej wysokości przycięcia twojego węzła jest pobierana z sieci na żądanie, więc ładuje się dłużej niż strona bloku niedawnego. Strona mówi o tym w trakcie oczekiwania.
- Instaluje się obok oficjalnego Mempoola. Każdy z nich ma własną bazę danych i własny adres.`,
    fr_FR: `Première version de Mempool Pruned, une variante de Mempool qui fonctionne avec un nœud Bitcoin élagué.

Mempool recherche normalement une transaction confirmée en la demandant directement à Bitcoin. Cela suppose un index des transactions, et un index des transactions ne peut pas être construit sur un nœud élagué : c'est pourquoi le paquet officiel exige un nœud archival. Cette variante interroge le serveur Electrum à la place. Ce serveur tient son propre index et récupère sur le réseau pair-à-pair tout bloc que votre nœud a écarté, de sorte que l'explorateur voit une chaîne complète sur un nœud qui n'en conserve pas.

- Nécessite Electrs Pruned. Le paquet officiel Electrs exige un nœud archival, c'est-à-dire exactement l'exigence que ce paquet supprime.
- Fonctionne avec Bitcoin Core, Knots, Knots pre-RDTS et Knots BLAKE2b, élagués ou archivals. Rien ici ne vous demande de changer votre nœud.
- La page d'un bloc situé sous la hauteur d'élagage de votre nœud est récupérée sur le réseau à la demande : elle met donc plus de temps à charger qu'une page récente. La page le signale pendant l'attente.
- S'installe à côté du Mempool officiel. Chacun conserve sa propre base de données et sa propre adresse.`,
  },
  migrations: {
    up: async ({ effects }) => {
      // The file model's defaults only reach missing or invalid keys, and an
      // older install already holds a valid EXTERNAL_MAX_RETRY of 1.
      await configJson.merge(effects, { MEMPOOL: EXTERNAL_RETRY })
      // Replay keys left behind by bitcoind's two config-action renames. They
      // still demand `prune: 0, txindex: true`, so they collide the moment
      // Mempool asks bitcoind for anything else (issue #73). clearTask filters
      // by id, so an install that never wrote them is unaffected.
      await sdk.action.clearTask(
        effects,
        'bitcoind:config',
        'bitcoind:other-config',
      )
    },
    down: IMPOSSIBLE,
  },
})
