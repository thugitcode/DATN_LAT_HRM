import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Checkbox, Flex, Input, Stack, Text } from "@mantine/core";

import { Icons } from "@/components/icons";

export interface FlatNode<T> {
  value: string;
  label: string;
  level: number;
  hasChildren: boolean;
  parentValue?: string;
  item?: T;
}

const CHILD_NODE_OFFSET = 28;

export type CommonVirtualTreeProps<T> = {
  data?: FlatNode<T>[];
  values?: Set<string>;
  onChange?: (values: Set<string>, options: FlatNode<T>[], checked: boolean) => void;
};

export const CommonVirtualTree = <T,>({
  data = [],
  values = new Set(),
  onChange = () => {},
}: CommonVirtualTreeProps<T>) => {
  const [search, setSearch] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(data.map((node) => node.value))
  );

  // Filter and show only visible nodes based on search and expanded state
  const visibleNodes = useMemo(() => {
    if (!search) {
      // No search: show expanded nodes
      return data.filter((node) => {
        if (node.level === 0) return true;
        return expandedNodes.has(node.parentValue!);
      });
    }

    // With search: filter and auto-expand matching parents
    const searchLower = search.toLowerCase();
    const matchingNodes = data.filter((node) => node.label.toLowerCase().includes(searchLower));

    const matchingParents = new Set<string>();
    matchingNodes.forEach((node) => {
      if (node.parentValue) {
        matchingParents.add(node.parentValue);
      }
    });

    return data.filter((node) => {
      if (node.level === 0) {
        // Show parent if it matches or has matching children
        return node.label.toLowerCase().includes(searchLower) || matchingParents.has(node.value);
      }

      // Show child if parent matches or child matches
      return (
        matchingNodes.includes(node) ||
        (node.parentValue && node.parentValue.toLowerCase().includes(searchLower))
      );
    });
  }, [data, search, expandedNodes]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
    // overscan: 5,
  });
  const items = virtualizer.getVirtualItems();

  const toggleExpanded = (value: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const toggleChecked = (node: FlatNode<T>) => {
    const next = new Set(values);
    const updatedChildren: FlatNode<T>[] = [];
    let checked = false;

    if (node.hasChildren) {
      // Toggle parent node
      const allChildren = data.filter((n) => n.parentValue === node.value);

      if (next.has(node.value)) {
        // Uncheck parent and all children
        next.delete(node.value);

        if (allChildren.length > 0) {
          allChildren.forEach((child) => {
            next.delete(child.value);
            // Chỉ add vào updatedChildren nếu child không có children
            if (!child.hasChildren) {
              updatedChildren.push(child);
            }
          });
        }

        checked = false;
      } else {
        // Check parent and all children
        next.add(node.value);

        if (allChildren.length > 0) {
          allChildren.forEach((child) => {
            next.add(child.value);
            // Chỉ add vào updatedChildren nếu child không có children
            if (!child.hasChildren) {
              updatedChildren.push(child);
            }
          });
        }

        checked = true;
      }
    } else {
      // Toggle child node (node không có children)
      if (next.has(node.value)) {
        next.delete(node.value);

        // Uncheck parent if exists
        if (node.parentValue) {
          next.delete(node.parentValue);
        }

        // Add node vào updatedChildren vì nó không có children
        updatedChildren.push(node);

        checked = false;
      } else {
        next.add(node.value);

        // Check if all siblings are checked, then check parent
        if (node.parentValue) {
          const allSiblings = data.filter((n) => n.parentValue === node.parentValue);
          const allSiblingsChecked = allSiblings.every((sibling) => next.has(sibling.value));

          if (allSiblingsChecked) {
            next.add(node.parentValue);
          }
        }

        // Add node vào updatedChildren vì nó không có children
        updatedChildren.push(node);

        checked = true;
      }
    }

    onChange(next, updatedChildren, checked);
  };

  const isIndeterminate = (node: FlatNode<T>): boolean => {
    if (!node.hasChildren) return false;

    const children = data.filter((n) => n.parentValue === node.value);
    const checkedChildren = children.filter((child) => values.has(child.value));

    return checkedChildren.length > 0 && checkedChildren.length < children.length;
  };

  return (
    <Stack gap="sm" h="100%" pb="xs" style={{ overflow: "hidden" }}>
      <Input
        placeholder="Tìm kiếm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftSection={<Box component={Icons.search} w={20} />}
        variant="filled"
        mx="sm"
      />

      <Box ref={parentRef} flex={1} px="sm" style={{ overflowY: "auto" }}>
        <Box h={virtualizer.getTotalSize()} w="100%" pos="relative">
          <Box
            pos="absolute"
            top={0}
            left={0}
            w="100%"
            style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
          >
            {items.map((virtualRow) => {
              const node = visibleNodes[virtualRow.index];
              const checked = values.has(node?.value ?? "");
              const indeterminate = node ? isIndeterminate(node) : false;
              const expanded = expandedNodes.has(node?.value ?? "");

              return (
                <Flex
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  gap="xs"
                  mb="xs"
                  pl={node?.level ? node.level * CHILD_NODE_OFFSET : 0}
                  align="center"
                  style={{ cursor: "pointer" }}
                  onClick={() => (node ? toggleChecked(node) : undefined)}
                >
                  {node?.hasChildren ? (
                    <Box
                      component={Icons.down}
                      miw={18}
                      w={18}
                      style={{
                        transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 150ms ease",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (search) return;
                        toggleExpanded(node?.value ?? "");
                      }}
                    />
                  ) : null}

                  <Checkbox.Indicator checked={checked} indeterminate={indeterminate} />

                  <Text component="span" size="sm" fw={500}>
                    {node?.label ?? ""}
                  </Text>
                </Flex>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};
