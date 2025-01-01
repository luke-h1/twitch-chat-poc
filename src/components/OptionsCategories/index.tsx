import React from "react";
import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import { ENTER_HIGHLIGHT_KEYWORDS_TEXT } from "@frontend/store/options/config";
import { optionsCategoriesSelector } from "@frontend/store/options/selectors";
import { optionChanged } from "@frontend/store/slices/chat/slice";
import Switch from "../Switch";
import Select from "../Select";

const OptionsRoot = styled.div`
  padding: 0 8px;
  width: 320px;
  min-height: calc(480px - 48px);
`;
const Categories = styled.div`
  height: 100%;
`;
const Category = styled.div`
  &:not(:last-child) {
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }
`;
const CategoryHeader = styled.div`
  padding: 8px;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
`;
const CategoryItems = styled.div``;
const Option = styled.div<{ $isButton?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 20px;
  cursor: pointer;

  &:hover {
    background-color: ${(p) =>
      p.$isButton ? "rgba(255, 255, 255, 0.2)" : "transparent"};
  }
`;
const OptionText = styled.span``;

const Options = () => {
  const dispatch = useAppDispatch();
  const optionsCategories = useAppSelector(optionsCategoriesSelector);

  return (
    <OptionsRoot>
      <Categories>
        {optionsCategories.map((category) => (
          <Category key={category.id}>
            {!!category.title && (
              <CategoryHeader>{category.title}</CategoryHeader>
            )}
            <CategoryItems>
              {category.items &&
                category.items.map(
                  ({ name, title, description, component }) => (
                    <Option
                      key={name}
                      title={description}
                      $isButton={component.type === "input"}
                      onMouseDown={() => {
                        if (component.type === "switch") {
                          dispatch(
                            optionChanged({
                              section: category.id,
                              name,
                              value: !component.value,
                            })
                          );
                        }
                        if (component.type === "input") {
                          const value = prompt(
                            ENTER_HIGHLIGHT_KEYWORDS_TEXT,
                            component.value
                          );
                          if (!value || !value.trim()) return;
                          dispatch(
                            optionChanged({ section: category.id, name, value })
                          );
                        }
                      }}
                    >
                      <OptionText>{title}</OptionText>
                      {component.type === "switch" && (
                        <Switch
                          id={`${category.id}-${name}`}
                          label={`${category.id}-${name}`}
                          checked={component.value}
                        />
                      )}
                      {component.type === "select" && (
                        <Select
                          style={{ width: 80 }}
                          onChange={(e) =>
                            dispatch(
                              optionChanged({
                                section: category.id,
                                name,
                                value: e.currentTarget.value,
                              })
                            )
                          }
                          value={component.value}
                        >
                          {component.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Option>
                  )
                )}
            </CategoryItems>
          </Category>
        ))}
      </Categories>
    </OptionsRoot>
  );
};

export default Options;
